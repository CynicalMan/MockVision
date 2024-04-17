import matplotlib.pyplot as plt
from shapely.geometry import Polygon


def plot_boxes(polygons):
    # Create a plot to visualize the polygons
    plt.figure(figsize=(6, 6))

    # Plot each polygon
    for poly in polygons:
        x, y = poly.exterior.xy  # Extract x and y coordinates
        plt.plot(x, y)

    plt.xlabel('X Coordinates')
    plt.ylabel('Y Coordinates')
    plt.title('Visualizing Array of Polygons')
    plt.grid(True)
    plt.show()
