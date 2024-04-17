import random

import shapely

from processing.helper import generate_rand_counts
from processing.image import generate_textured_image, pre_process_web_data
from processing.polygon import generate_3D_models
from model.utils import process_centroid_generator_model, \
    process_input_boundaries_model, get_rooms_counts

from model import rooms_counts_model, regressor_model, boundaries_model


def generate_floor_plan(data, output_name,no_samples):
    #{'mask': [[288, 112], [1152, 112], [1152, 576], [288, 576]], 'door_pos': [288, 283.3999938964844], 'area': 62.640000000000015}
    scaled_data = pre_process_web_data(data)
    print(scaled_data)

    inner_poly, door_poly = scaled_data["mask"], scaled_data["door_pos"]
    area = data["area"]
    generated_count = generate_rand_counts(no_samples, inner_poly, door_poly, area)
    for i, (bed_count, bath_count) in enumerate(generated_count):

        print(f"\niteration no. {i}\nbed count : {bed_count} , "
              f"bath_count : {bath_count}")

        rooms_centroids = process_centroid_generator_model(regressor_model,
                                                           inner_poly,
                                                           door_poly,
                                                           no_bedrooms=bed_count,
                                                           no_bathrooms=bath_count,
                                                           area=area,
                                                           neighbours_poly=None)
        print(f"\nrooms_centroids : {rooms_centroids}")

        bedrooms, bathrooms, kitchen = (rooms_centroids["bedroom"],
                                        rooms_centroids["bathroom"],
                                        rooms_centroids["kitchen"])

        rooms_polygons = process_input_boundaries_model(boundaries_model,
                                                        inner_poly,
                                                        door_poly,
                                                        bedrooms, bathrooms,
                                                        kitchen, output_name=i)

        generate_textured_image(rooms_polygons, area=area, output_name=i)

        # generate_3D_models(rooms_polygons, output_name=output_name)
