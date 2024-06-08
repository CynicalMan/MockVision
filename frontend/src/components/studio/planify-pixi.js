import React, { Component } from "react";
import * as PIXI from "pixi.js";
import FastVector from "fast-vector";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import { getGridRect, submitData, getText, updateText } from "./helpers";
import * as turf from "@turf/turf";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons'





import "./studio.css";
// import { useNavigate } from 'react-router-dom';
import { useNavigation } from "react-router-dom";

import { useState, useEffect } from "react";
import axios from "axios";

class PlanifyDraw extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.spinner = React.createRef();

    this.zoom = 1;

    this.state = {
      doorMode: 0,
    };
  }

  // navigate = useNavigate();

  componentDidMount() {
    if (this.first) return;
    this.first = true;
    this.done = false;
    this.last_point = null;
    this.align = true;
    this.align_grid = true;
    this.horver = true;

    this.x_aligns = [];
    this.y_aligns = [];
    this.area = 0;

    this.scale = 80;
    this.grid_pitch_big = 80;
    this.grid_pitch = 8;
    this.align_factor = 5;

    this.mode = 0;
    // this.zoom = 1;
    this.door_poly = null;
    this.selected_door_poly = null;

    this.point_counter = 0;

    this.isMouseDown = false;

    this.drag_grid_start_pos = null;
    this.gridXOffset = 0;
    this.gridYOffset = 0;

    // creating app

    const w = 1920;
    const h = 1080;

    this.width = w;
    this.height = h;

    this.app = new PIXI.Application({
      width: w,
      height: h,
      backgroundColor: 0xffffff,
      antialias: true,
    });

    // create a renderer instance
    this.renderer = PIXI.autoDetectRenderer(1000, 1000);
    // create a manager instance, passing stage and renderer.view
    this.manager = new PIXI.InteractionManager(
      this.app.stage,
      this.app.renderer.view
    );
    // creating Grid and adding it to the stage
    // grid shader
    this.camera = this.app.stage;

    this.container = new PIXI.Container();
    this.textContainer = new PIXI.Container();
    this.doorContainer = new PIXI.Container();

    this.areaText = new PIXI.Text("Area: 0", {});
    this.areaText.visible = false;
    this.areaText.anchor.set(0.5);

    // create a new Sprite from an image path
    this.ch = PIXI.Sprite.from(
      "https://cdn-icons-png.flaticon.com/512/165/165044.png"
    );
    this.ch.anchor.set(0.5);
    this.ch.setTransform(
      this.app.renderer.width / 2,
      this.app.renderer.height / 2,
      0.06,
      0.06,
      90
    );

    const ch = this.ch;
    const app = this.app;
    this.app.renderer.plugins.interaction.defaultCursorStyle = "inherit";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.interactive = true;

    function cursorCroshair(event) {
      let x = event.data.global.x;
      let y = event.data.global.y;

      ch.x = x + ch.width / 4;
      ch.y = y + (2 * ch.height) / 3;
      if (x < w && y < h && y > 0 && x > 0) {
        document.getElementById("root").style.cursor = "none";
        if (!ch.visible) ch.visible = true;
      } else {
        document.getElementById("root").style.cursor = "default";
        if (ch.visible) ch.visible = false;
      }
    }

    this.app.stage.on("mousemove", cursorCroshair);

    // Listen for animate update
    // this.app.ticker.add(function(delta) {
    //     // just for fun, let's rotate mr rabbit a little
    //     // delta is 1 if running at 100% performance
    //     // creates frame-independent tranformation
    //     this.ch.x += Math.cos(this.ch.rotation) * delta;
    //     this.ch.y += Math.sin(this.ch.rotation) * delta;
    // });
    this.app.start();

    this.app.view.style.cursor = "none";

    this.canvasRef.current.appendChild(this.app.view);

    // Creating Geometry
    this.plan_points = [];
    this.texts = [];
    this.current_text = getText("0.0");

    this.lines = new PIXI.Graphics();
    this.doorLines = new PIXI.Graphics();
    this.text = new PIXI.Graphics();
    this.grid = getGridRect(w, h, this.grid_pitch, this.grid_pitch_big);

    this.app.stage.addChild(this.grid);
    this.app.stage.addChild(this.container);
    this.app.stage.addChild(this.textContainer);
    this.app.stage.addChild(this.doorContainer);
    this.container.addChild(this.lines);
    this.textContainer.addChild(this.current_text);
    // this.container.addChild(this.textContainer);
    this.app.stage.addChild(this.ch);
    this.container.addChild(this.areaText);
    this.doorContainer.addChild(this.doorLines);

    this.app.stage.addListener("mousedown", this.onMouseDown, false);
    this.app.stage.addListener("rightdown", this.onRightClick, false);
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    // this.animate();

    // Events Handlers
    // window.addEventListener("resize", this.handleWindowResize);

    const camera = this.app.stage;

    // this.manager.on("pointermove", (e) => {
    //     const {x, y} = e.data.global;

    //     camera.x = -x + this.renderer.width / 2;
    //     camera.y = -y + this.renderer.height / 2;
    // });

    this.app.view.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;

      let current = this.grid_pitch;
      let new_pitch = current + delta * 1;

      new_pitch = Math.max(2, Math.min(new_pitch, 100));

      this.grid_pitch = new_pitch;
      this.grid_pitch_big = new_pitch * 10;
      // conevert bext value  to int then add one
      this.align_factor = Math.floor(new_pitch / 2) + 1;
      this.scale = this.grid_pitch_big;

      let mouse_pos = this.getMousePos(true);

      let gridXOffset =
        (mouse_pos.x - this.gridXOffset * this.grid_pitch) / current;
      let gridYOffset =
        (mouse_pos.y - this.gridYOffset * this.grid_pitch) / current;

      let newLengthX = gridXOffset * new_pitch;
      let newLengthY = gridYOffset * new_pitch;

      gridXOffset = newLengthX - this.gridXOffset;
      gridYOffset = newLengthY - this.gridYOffset;

      // if (gridXOffset < -this.grid_pitch_big || gridXOffset > this.grid_pitch_big) gridXOffset = Math.floor(((gridXOffset / this.grid_pitch_big) % 1 * 10))/10 * this.grid_pitch_big;
      // if (gridYOffset < -this.grid_pitch_big || gridYOffset > this.grid_pitch_big) gridYOffset = Math.floor(((gridYOffset / this.grid_pitch_big) % 1 * 10))/10 * this.grid_pitch_big;

      gridXOffset =
        (Math.floor(((gridXOffset / this.grid_pitch_big) % 1) * 10) / 10) *
        this.grid_pitch_big;
      gridYOffset =
        (Math.floor(((gridYOffset / this.grid_pitch_big) % 1) * 10) / 10) *
        this.grid_pitch_big;

      gridXOffset = gridXOffset - this.grid_pitch_big;
      gridYOffset = gridYOffset - this.grid_pitch_big;
      this.app.stage.removeChild(this.grid);
      this.grid = getGridRect(
        this.width,
        this.height,
        this.grid_pitch,
        this.grid_pitch_big,
        0,
        0
      );
      this.app.stage.addChildAt(this.grid, 0);

      // print mouise position
      this.plan_points.forEach((point) => {
        point.x = (point.x / current) * new_pitch;
        point.y = (point.y / current) * new_pitch;
      });
      if (this.door_poly) {
        this.door_poly[0] = (this.door_poly[0] / current) * new_pitch;
        this.door_poly[1] = (this.door_poly[1] / current) * new_pitch;
      }

      let vNow = this.last_point;
      let last = this.plan_points[this.plan_points.length - 1];

      if (!this.done && this.plan_points.length > 0) {
        if (this.horver) {
          if (this.isHorizontal(last, vNow)) {
            vNow.y = last.y;
          } else {
            vNow.x = last.x;
          }
          this.last_point = vNow;
        }
      }

      this.drawShape();
    });
  }

  isCollide = (a, b, factor = 10) => {
    const d = a.distance(b);
    if (d <= factor) return true;
    return false;
  };

  isInsidePolygon(point) {
    var x = point.x,
      y = point.y;
    var inside = false;
    for (
      var i = 0, j = this.plan_points.length - 1;
      i < this.plan_points.length;
      j = i++
    ) {
      var xi = this.plan_points[i].x,
        yi = this.plan_points[i].y;
      var xj = this.plan_points[j].x,
        yj = this.plan_points[j].y;

      var intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  closePoint = (mouse_pos, factor = 8) => {
    for (var i = 0; i < this.plan_points.length; i++) {
      if (this.isCollide(this.plan_points[i], mouse_pos, factor))
        return this.plan_points[i];
    }
    return null;
  };

  closeLine = (mouse_pos, factor = 0.06) => {
    let a, b;
    let points = this.plan_points.slice(0);
    points.push(points[0]);

    for (var i = 0; i < points.length - 1; i++) {
      a = points[i];
      b = points[i + 1];
      if (
        a.distance(mouse_pos) + b.distance(mouse_pos) <=
        a.distance(b) + factor
      )
        return [a, b];
    }

    return null;
  };

  addPoint = (point) => {
    this.plan_points.push(point);
  };

  minMax = (points) => {
    let minPoint = points[0].clone();
    let maxPoint = points[0].clone();

    for (var i = 0; i < points.length; i++) {
      if (points[i].x < minPoint.x) minPoint.x = points[i].x;
      if (points[i].y < minPoint.y) minPoint.y = points[i].y;
      if (points[i].x < minPoint.x) minPoint.x = points[i].x;
      if (points[i].y > maxPoint.y) maxPoint.y = points[i].y;
    }

    return [minPoint, maxPoint];
  };

  drawText = (pos, scale, degree) => {
    this.lines.clear();
    this.lines.lineStyle({ width: 14 });
    this.lines.beginFill("0xe74c3c");
  };

  drawShape = () => {
    let end = 1;

    if (this.done) {
      // updating area text

      this.area = this.polyArea();
      // let [cx, cy] = this.polyCentroid();
      this.updatePolygon();
      const [cx, cy] = turf.centerOfMass(this.polygon).geometry.coordinates;
      this.areaText.text = "Area: " + this.area.toFixed(1).toString() + " m²";
      this.areaText.x = cx;
      this.areaText.y = cy;
    }
    if (this.done) end = 0;
    for (let i = 0; i < this.plan_points.length - end; i++) {
      let a = this.plan_points[i];
      let b = this.plan_points[(i + 1) % this.plan_points.length];

      let d = a.distance(b);
      let vec = b.sub(a).normalize();
      let pos = b.sub(vec.mul(d / 2));
      updateText(
        this.textContainer.getChildAt(i),
        (d / this.scale).toFixed(1).toString(),
        pos
      ); // + " m";
    }

    this.lines.clear();
    this.doorLines.clear();
    if (this.lines && this.plan_points.length > 0) {
      // aligns
      this.lines.alpha = 0.3;
      this.lines.lineStyle(1, "0x00aa00", 1);

      for (let i = 0; i < this.x_aligns.length; i++) {
        this.lines.moveTo(this.x_aligns[i], 0);
        this.lines.lineTo(this.x_aligns[i], 2000);
      }
      for (let i = 0; i < this.y_aligns.length; i++) {
        this.lines.moveTo(0, this.y_aligns[i]);
        this.lines.lineTo(10000, this.y_aligns[i]);
      }

      this.x_aligns = [];
      this.y_aligns = [];

      this.lines.alpha = 1;

      if (this.done && this.selected_line !== null) {
        this.lines.lineStyle(6, "0xcf0000", 1);
        this.lines.moveTo(this.selected_line[0].x, this.selected_line[0].y);
        this.lines.lineTo(this.selected_line[1].x, this.selected_line[1].y);
      }

      // polygon
      this.lines.lineStyle({ width: 2.5 });
      let polyColor = "0xffd000";
      let polySelected =
        this.done &&
        (this.selected_polygon || this.selected_line || this.selected_point);
      this.lines.beginFill(
        polyColor,
        this.isMouseDown && polySelected && !this.drag_grid_start_pos ? 0.7 : 1
      );
      this.lines.moveTo(this.plan_points[0].x, this.plan_points[0].y);
      if (!this.done) this.lines.endFill();

      this.plan_points.map((l) => this.lines.lineTo(l.x, l.y));
      if (this.last_point) {
        this.lines.lineTo(this.last_point.x, this.last_point.y);
        if (this.plan_points.length >= 1) {
          let d = this.last_point.distance(
            this.plan_points[this.plan_points.length - 1]
          );

          let vec = this.last_point
            .sub(this.plan_points[this.plan_points.length - 1])
            .normalize();
          let pos = this.last_point.sub(vec.mul(d / 2));

          updateText(
            this.current_text,
            (d / this.scale).toFixed(1).toString(),
            pos
          ); // + " m";
        }
      }
      if (this.done) {
        this.lines.closePath();
        this.lines.endFill();
      }

      // selected line
      if (this.done && this.selected_line !== null) {
        this.lines.lineStyle(3, this.isMouseDown ? 0xff0000 : 0xaa0000, 1);
        this.lines.moveTo(this.selected_line[0].x, this.selected_line[0].y);
        this.lines.lineTo(this.selected_line[1].x, this.selected_line[1].y);
      }

      let width = window.screen.width;
      let height = window.screen.height;

      // console.log(width, height);

      if (this.door_poly) {
        let width = 0;
        let height = 0;
        let color = "0x00ff04";

        let door_poly = this.door_poly;

        if (this.mode === 1) {
          color = "0x888888";
        }
        if (this.door_horiz) {
          width = (70 * this.scale) / 90;
          height = (15 * this.scale) / 90;
          if (this.door_right) {
            door_poly = [door_poly[0], door_poly[1] + height / 2];
          } else {
            door_poly = [door_poly[0], door_poly[1] - height / 2];
          }
        } else {
          width = (15 * this.scale) / 90;
          height = (70 * this.scale) / 90;

          if (this.door_right) {
            door_poly = [door_poly[0] + width / 2, door_poly[1]];
          } else {
            door_poly = [door_poly[0] - width / 2, door_poly[1]];
          }
        }
        this.doorLines.lineStyle({ width: 2 });
        this.doorLines.beginFill(color);
        this.doorLines.moveTo(
          door_poly[0] - width / 2,
          door_poly[1] - height / 2
        );
        this.doorLines.lineTo(
          door_poly[0] + width / 2,
          door_poly[1] - height / 2
        );
        this.doorLines.lineTo(
          door_poly[0] + width / 2,
          door_poly[1] + height / 2
        );
        this.doorLines.lineTo(
          door_poly[0] - width / 2,
          door_poly[1] + height / 2
        );
        this.doorLines.closePath();
        this.doorLines.endFill();
      }
      // Points
      this.lines.lineStyle(0);
      this.lines.beginFill("0x070a5e", 1);
      this.plan_points.map((l) => this.lines.drawCircle(l.x, l.y, 6));
      this.lines.endFill();

      // initial point and selected to red

      let first_point_align = false;
      if (
        this.last_point &&
        (this.last_point.x === this.plan_points[0].x ||
          this.last_point.y === this.plan_points[0].y)
      ) {
        first_point_align = true;
      }

      if (!this.done) {
        this.lines.beginFill("0xff5555", 0.5);
        this.lines.drawCircle(this.plan_points[0].x, this.plan_points[0].y, 6);
        this.lines.endFill();
      } else if (
        this.done &&
        this.selected_point !== null &&
        !first_point_align
      ) {
        if (this.isMouseDown) {
          this.lines.beginFill("0xff0600", this.isMouseDown ? 1 : 1);
          this.lines.drawCircle(
            this.selected_point.x,
            this.selected_point.y,
            8
          );
          this.lines.endFill();
        } else {
          this.lines.beginFill("0xaa1111", this.isMouseDown ? 1 : 1);
          this.lines.drawCircle(
            this.selected_point.x,
            this.selected_point.y,
            7
          );
          this.lines.endFill();
        }
      }

      if (first_point_align) {
        this.lines.beginFill("0xff0600", 1);
        this.lines.drawCircle(this.plan_points[0].x, this.plan_points[0].y, 7);
        this.lines.endFill();
      }
    }
  };

  getMousePos = (asVector = false, alignGrid = false) => {
    let x = this.app.renderer.plugins.interaction.mouse.global.x / this.zoom;
    let y = this.app.renderer.plugins.interaction.mouse.global.y / this.zoom;
    if (alignGrid) {
      x = Math.round(x / this.grid_pitch) * this.grid_pitch;
      y = Math.round(y / this.grid_pitch) * this.grid_pitch;
    }
    if (asVector) return new FastVector(x, y);
    return [x, y];
  };

  alignWith = (
    current,
    target,
    factor = 5,
    exclude = [],
    align_x = true,
    align_y = true,
    align_grid = this.align_grid
  ) => {
    align_x = align_grid && align_x;
    align_y = align_grid && align_y;
    let pitchs = [this.grid_pitch, this.grid_pitch_big];
    if (align_x || align_y) {
      for (let i = 0; i < pitchs.length; i++) {
        if (
          align_x &&
          (current.x % pitchs[i] > pitchs[i] - factor ||
            current.x % pitchs[i] < factor)
        ) {
          current.x = Math.round(current.x / pitchs[i]) * pitchs[i];
          this.x_aligns.push(current.x);
        }
        if (
          align_y &&
          (current.y % pitchs[i] > pitchs[i] - factor ||
            current.y % pitchs[i] < factor)
        ) {
          current.y = Math.round(current.y / pitchs[i]) * pitchs[i];
          this.y_aligns.push(current.y);
        }
      }
    }
    for (let i = 0; i < target.length; i++) {
      if (exclude.includes(target[i])) continue;
      if (!align_x && !align_y) break;
      if (
        align_x &&
        current !== target[i] &&
        current.x <= factor + target[i].x &&
        current.x >= target[i].x - factor
      ) {
        current.x = target[i].x;
        this.x_aligns.push(target[i].x);
        align_x = false;
      }
      if (
        align_y &&
        current !== target[i] &&
        current.y <= factor + target[i].y &&
        current.y >= target[i].y - factor
      ) {
        current.y = target[i].y;
        this.y_aligns.push(target[i].y);
        align_y = false;
      }
    }
  };

  alignPoints = (point, points, exclude = []) => {};
  onRightClick = (e) => {
    if (this.done && this.mode === 1) {
      this.mode = 0;
      this.setState({ doorMode: 0 });
      this.door_poly = [];
    } else if (this.done && this.mode === 0) {
      // this.done = false;
      // this.mode = 1;
      // this.door_poly = [];
      // // return events to work
      // this.onMoveDraw(e);
      // this.app.stage.removeListener("mousemove", this.onMoveDraw, false);
      //  remove poly and reset
      // this.mode = 0;
      // this.done = false;
      // this.door_poly = [];
      // this.plan_points = [];
      // this.textContainer.removeChildren();
      // this.lines.clear();
      // this.drawShape();
      // this.app.stage.removeListener("mousemove", this.onMoveDraw, false);
      // this.app.stage.removeListener("mousedown", this.onMouseDown, false);
      // this.app.stage.removeListener("mouseup", this.onMouseUp, false);
    } else if (!this.done) {
      if (this.plan_points.length == 1) return;
      this.plan_points.pop();
      this.textContainer.removeChildAt(this.textContainer.children.length - 2);
      this.onMoveDraw(e);
      this.drawShape();
    }
    this.drawShape();
  };

  onMoveDraw = (evt) => {
    let new_point = this.getMousePos(true);
    let last = this.plan_points[this.plan_points.length - 1];
    let first = this.plan_points[0];

    if (this.plan_points.length > 0) {
      if (this.horver) {
        if (this.isHorizontal(last, new_point)) {
          new_point.y = last.y;
        } else {
          new_point.x = last.x;
        }
      }
      if (this.align) {
        this.alignWith(new_point, [first], this.align_factor);
        this.alignWith(new_point, this.plan_points, this.align_factor);
      }
      this.last_point = new_point;

      this.drawShape();
    }
  };

  onDragPoint = (evt) => {
    if (this.app) {
      let prev, next;
      if (this.selected_point === null) return;

      let new_pos = this.getMousePos(true);

      if (this.horver) {
        let idx = this.plan_points.indexOf(this.selected_point);

        let prev_idx = idx - 1;
        let next_idx = idx + 1;

        if (prev_idx < 0) prev_idx = this.plan_points.length - 1;
        if (next_idx >= this.plan_points.length) next_idx = 0;

        prev = this.plan_points[prev_idx];
        next = this.plan_points[next_idx];
      }
      if (this.align) {
        let first = this.plan_points[0];
        this.alignWith(
          new_pos,
          this.plan_points.concat([first]),
          this.align_factor,
          [this.selected_point, prev, next]
        );
      }

      if (this.horver) {
        if (this.isHorizontal(this.selected_point, prev)) {
          prev.y = new_pos.y;
        } else {
          prev.x = new_pos.x;
        }
        if (this.isHorizontal(this.selected_point, next)) {
          next.y = new_pos.y;
        } else {
          next.x = new_pos.x;
        }
      }

      this.selected_point.x = new_pos.x;
      this.selected_point.y = new_pos.y;
      this.drawShape();
    }
  };

  isHorizontal = (p1, p2) => {
    return Math.abs(p1.x - p2.x) > Math.abs(p1.y - p2.y);
  };

  onDragLine = (evt) => {
    if (this.app) {
      if (this.selected_line === null) return;

      var mpos = this.getMousePos(true);

      let align_x = true;
      let align_y = true;

      if (this.horver) {
        if (this.isHorizontal(this.selected_line[0], this.selected_line[1])) {
          mpos.x = this.selected_line[0].x - this.selected_line_abs[0].x;
          align_x = false;
        } else {
          mpos.y = this.selected_line[0].y - this.selected_line_abs[0].y;
          align_y = false;
        }
      }

      if (this.align)
        this.alignWith(
          mpos,
          this.plan_points,
          this.align_factor,
          this.selected_line,
          align_x,
          align_y
        );

      this.selected_line[0].x = this.selected_line_abs[0].x + mpos.x;
      this.selected_line[0].y = this.selected_line_abs[0].y + mpos.y;
      this.selected_line[1].x = this.selected_line_abs[1].x + mpos.x;
      this.selected_line[1].y = this.selected_line_abs[1].y + mpos.y;

      this.drawShape();
    }
  };

  onDragPolygon = (evt) => {
    if (this.app) {
      if (this.selected_polygon === null) return;
      let [minPoint, maxPoint] = this.minMax(this.selected_polygon);

      let mouse_pos = this.getMousePos(true, true);

      let newMin = minPoint.add(mouse_pos);
      let newMax = maxPoint.add(mouse_pos);

      if (newMax.x > 800) mouse_pos.x = 800 - newMax.x;
      if (newMax.y > 600) mouse_pos.y = 600 - newMax.y;

      if (newMin.x < 0) mouse_pos.x = minPoint.x;
      if (newMin.y < 0) mouse_pos.y = minPoint.y;

      mouse_pos = this.getMousePos(true, true);
      if (mouse_pos)
        for (var i = 0; i < this.plan_points.length; i++) {
          this.plan_points[i] = this.selected_polygon[i].add(mouse_pos);
        }

      if (this.drag_grid_start_pos) {
        let gridXOffset =
          (mouse_pos.x -
            this.drag_grid_start_pos.x +
            this.gridXOffset * this.grid_pitch) %
          this.grid_pitch_big;
        let gridYOffset =
          (mouse_pos.y -
            this.drag_grid_start_pos.y +
            this.gridYOffset * this.grid_pitch) %
          this.grid_pitch_big;
        if (gridXOffset > 0) gridXOffset -= this.grid_pitch_big;
        if (gridYOffset > 0) gridYOffset -= this.grid_pitch_big;
        this.app.stage.removeChild(this.grid);
        this.grid = getGridRect(
          this.width,
          this.height,
          this.grid_pitch,
          this.grid_pitch_big,
          gridXOffset,
          gridYOffset
        );
        this.app.stage.addChildAt(this.grid, 0);
      }

      if (this.selected_door_poly) {
        this.door_poly[0] = this.selected_door_poly[0] + mouse_pos.x;
        this.door_poly[1] = this.selected_door_poly[1] + mouse_pos.y;
      }
      this.drawShape();
    }
  };

  getClosestPoint = (array, point) => {
    return array.reduce(
      (closestPoint, currentPoint) => {
        const distance = Math.sqrt(
          (currentPoint.geometry.coordinates[0] -
            point.geometry.coordinates[0]) **
            2 +
            (currentPoint.geometry.coordinates[1] -
              point.geometry.coordinates[1]) **
              2
        );
        return distance < closestPoint.distance
          ? { point: currentPoint, distance: distance }
          : closestPoint;
      },
      { point: null, distance: Infinity }
    ).point;
  };

  onSelect = (evt) => {
    if (this.done) {
      var vNow = this.getMousePos(true);

      if (this.mode === 1) {
        let lv = turf.lineString([
          [vNow.x, 0],
          [vNow.x, 4000],
        ]);
        let lh = turf.lineString([
          [0, vNow.y],
          [4000, vNow.y],
        ]);

        let p1 = turf.lineIntersect(lv, this.polygon).features;
        let p2 = turf.lineIntersect(lh, this.polygon).features;
        const point = turf.point([vNow.x, vNow.y]);

        let allp = p1.concat(p2);
        let center = turf.centerOfMass(this.polygon).geometry.coordinates;
        if (allp.length) {
          const nearest = this.getClosestPoint(allp, point);
          this.door_poly = nearest.geometry.coordinates;
          if (p1.includes(nearest)) {
            this.door_horiz = true;
            // check if the point at left or right of current pos and outside polygon
            if (
              (nearest.geometry.coordinates[1] < vNow.y &&
                center[1] < vNow.y) ||
              (nearest.geometry.coordinates[1] > vNow.y && center[1] < vNow.y)
            ) {
              this.door_right = true;
            } else {
              this.door_right = false;
            }
          } else {
            this.door_horiz = false;
            if (
              (nearest.geometry.coordinates[0] < vNow.x &&
                center[0] < vNow.x) ||
              (nearest.geometry.coordinates[0] > vNow.x && center[0] < vNow.x)
            ) {
              this.door_right = true;
            } else {
              this.door_right = false;
            }
          }
          this.drawShape();
        }
        return;
      }

      if (this.mode === 1) return;

      var close_point = this.closePoint(vNow);
      var close_line = this.closeLine(vNow);

      if (close_point !== null) {
        this.selected_point = close_point;
        this.selected_line = null;
        this.drawShape();
        return;
      } else if (close_line !== null) {
        this.selected_line = close_line;
        this.selected_point = null;
        this.selected_line_abs = [
          this.selected_line[0].sub(vNow),
          this.selected_line[1].sub(vNow),
        ];
        this.drawShape();
        return;
      } else {
        this.selected_line = null;
        this.selected_point = null;
        this.drawShape();
      }
      return;
    }
  };

  polyArea = () => {
    let data = this.plan_points;
    let x = data.map((l) => (l.x / this.scale).toFixed(1));
    let y = data.map((l) => (l.y / this.scale).toFixed(1));
    let area = 0;
    for (let i = 0; i < x.length - 1; i++) {
      area += x[i] * y[i + 1] - x[i + 1] * y[i];
    }
    area += x[x.length - 1] * y[0] - x[0] * y[x.length - 1];
    return 0.5 * Math.abs(area);
  };

  polyCentroid = () => {
    let data = this.plan_points;
    let x = data.map((l) => l.x);
    let y = data.map((l) => l.y);
    let cx = 0,
      cy = 0;
    for (let i = 0; i < x.length; i++) {
      cx += x[i];
      cy += y[i];
    }
    cx = cx / x.length;
    cy = cy / x.length;
    return [cx, cy];
  };

  updatePolygon = () => {
    let ps = this.plan_points.map((p) => [p.x, p.y]);
    ps = [...ps, ps[0]];
    this.polygon = turf.polygon([ps]);
  };

  onMouseUp = (evt) => {
    this.isMouseDown = false;
    this.app.stage.removeListener("mousemove", this.onDragPoint, false);
    this.app.stage.removeListener("mousemove", this.onDragLine, false);
    this.app.stage.removeListener("mousemove", this.onDragPolygon, false);

    if (this.drag_grid_start_pos) {
      var last = this.getMousePos(true, true);
      this.gridXOffset =
        (last.x -
          this.drag_grid_start_pos.x +
          this.gridXOffset * this.grid_pitch) /
        this.grid_pitch;
      this.gridYOffset =
        (last.y -
          this.drag_grid_start_pos.y +
          this.gridYOffset * this.grid_pitch) /
        this.grid_pitch;
      this.drag_grid_start_pos = null;
    }

    if (this.done) {
      this.app.stage.on("mousemove", this.onSelect, false);
    }
    this.selected_line = null;
    this.selected_point = null;
    this.selected_polygon = null;
    this.drag_grid_start_pos = null;

    this.drawShape();
  };

  assignRef = (element) => {
    this.container = element;
  };

  onMouseDown = (evt) => {
    if (this.mode === 0) {
      this.isMouseDown = true;
    }

    if (evt.which === 3) return;

    if (this.last_point) {
      var vNow = this.last_point.clone();
    } else {
      var vNow = this.getMousePos(true, true);
    }

    this.app.stage.removeListener("mousemove", this.onMoveDraw, false);
    this.app.stage.removeListener("mousemove", this.onSelect, false);

    this.last_point = null;

    if (this.done) {
      if (this.door_poly && this.mode === 1) {
        this.mode = 0;
        this.setState({ doorMode: 0 });
        this.drawShape();
        return;
      }
      if (this.mode === 0) {
        var close_point = this.closePoint(vNow);
        var close_line = this.closeLine(vNow);

        if (close_point !== null) {
          this.selected_point = close_point;
          this.selected_line = null;
          this.app.stage.addListener("mousemove", this.onDragPoint, false);
          this.door_poly = [];
          this.drawShape();
          return;
        } else if (close_line !== null) {
          this.selected_line = close_line;
          this.selected_line_abs = [
            this.selected_line[0].sub(vNow),
            this.selected_line[1].sub(vNow),
          ];
          this.selected_point = null;
          this.door_poly = [];

          this.app.stage.addListener("mousemove", this.onDragLine, false);

          this.drawShape();
          return;
        } else {
          if (!this.isInsidePolygon(vNow)) {
            this.drag_grid_start_pos = vNow.clone();
          }
          this.selected_polygon = [];
          this.plan_points.map((l) => {
            this.selected_polygon.push(l.sub(vNow));
          });

          if (this.door_poly)
            this.selected_door_poly = [
              this.door_poly[0] - vNow.x,
              this.door_poly[1] - vNow.y,
            ];

          this.app.stage.addListener("mousemove", this.onDragPolygon, false);
          this.drawShape();
          return;
        }

        return;
      }
    } else if (this.plan_points.length > 0) {
      let new_text = getText("0.0");
      this.textContainer.addChildAt(new_text, this.textContainer.length - 1);
    }

    if (
      this.plan_points.length >= 3 &&
      this.isCollide(this.plan_points[0], vNow)
    ) {
      vNow = this.plan_points[0];
      this.done = true;
      this.areaText.visible = true;
      this.textContainer.removeChildAt(0);

      this.drawShape();
      return;
    } else {
      this.plan_points.push(vNow);
      this.drawShape();
      this.app.stage.addListener("mousemove", this.onMoveDraw, false);
      this.app.stage.addListener("mouseup", this.onMouseUp, false);
    }
  };

  // animate
  animate = (evt) => {
    const width = this.canvasRef.current.offsetWidth;
    const height = this.canvasRef.current.offsetHeight;
    this.app.renderer.resize(this.width * 2, this.height * 2);
    requestAnimationFrame(this.animate);
    // if (this.plan_points.length > 0) this.last_point = this.getMousePos(evt)
    this.app.render();
    // this.current_pos = null
  };

  postRequest = (data) => {
    // send post request
    fetch("http://localhost:5000/design", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => (window.location.href = "/view2D"));
  };

  getPlanData = () => {
    this.spinner.current.innerHTML = `<div class="spinner">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
    <div class="bounce4"></div>
    <div class="bounce5"></div>
  </div>`;

    let reqData = {};
    // 1- get the data from the plan_points
    let data = this.plan_points;
    reqData.mask = data.map((l) => l.toArray());
    reqData.door_pos = this.door_poly;
    reqData.area = this.area;

    this.postRequest(reqData);
  };

  setDoorMode = () => {
    if (!this.done) return;
    this.mode = 1;
    this.door_poly = null;
    this.done = true;
    this.setState({ doorMode: 1 });
  };

  render() {
    return (
      <>
        <div className="notes">
          <p>Notes</p>
          <ul>
            <li>Draw your home boundaries</li>
            <li>The area must be larger than 60 meters</li>
            <li>You must add the door</li>
          </ul>
        </div>
        
        <div ref={this.spinner} className="container">
          <div ref={this.canvasRef} className="canvas-container" />

          <div className="Buttons">

         
            <div className="createDesign">
              <button onClick={this.getPlanData}>Create Design</button>
            </div>
            <div className="addDoor">
              
            
              <button onClick={this.setDoorMode}> <FontAwesomeIcon icon={faDoorClosed} />Add Door</button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default PlanifyDraw;
