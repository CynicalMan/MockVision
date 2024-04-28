import json
import os
import time
import uuid

import requests

from model import boundaries_model
from processing import generate_floor_plan
from flask import Flask, send_file
from flask import request
from flask_cors import CORS


os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
app = Flask(__name__)

app.config['SECRET_KEY'] = 'hello darkness my old friend'
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS()
cors.init_app(app)

# @app.route('/', methods=['GET'])
# def request_test():
#     if request.method == 'GET':
#         return 'AI service is up and running. Say thank you demon!'
#     else:
#         return "POST Error 405 Method Not Allowed"

global_no = 0

@app.route('/design',
           methods=['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS',
                    'HEAD'])
def design():
    if request.method == 'POST':
        data = request.get_json()
        # generate date dependent name
        name = time.strftime("%Y%m%d-%H%M%S")
        name = "output"
        no_samples = 4
        print(data)
        res = generate_floor_plan(data, output_name=name, no_samples=no_samples)  # 1
        # sleep(5)
        return "res"
        # return "POST request received. Thank you demon!"

    else:
        return (f"{request.method} requests are not allowed at this endpoint. "
                f"Only POST requests are allowed.")


@app.route('/convert3D/<int:sample_no>', methods=['GET'])
def convert3d(sample_no):
    if request.method == 'GET':
        global global_no
        global_no = sample_no
        return "sample_no"
    else:
        return "POST Error 405 Method Not Allowed"


@app.route('/render3D', methods=['GET'])
def render3d():
    if request.method == 'GET':
        print(global_no)
        file_path = f"outputs/rooms_polygons_{global_no}.json"

        with open(file_path, "r") as json_file:
            # Load the JSON data from the file
            loaded_json_variable = json.load(json_file)
        return loaded_json_variable
    else:
        return "POST Error 405 Method Not Allowed"



if __name__ == '__main__':
    app.run(debug=True, port=5000)
