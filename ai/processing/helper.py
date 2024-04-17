import random

from model import rooms_counts_model
from model.utils import get_rooms_counts


def generate_rand_counts(no_samples, inner_poly, door_poly, area):
    print(f"start generating {no_samples}")
    generated_count = set()

    for i in range(no_samples):
        if i == 0:
            bed_count, bath_count = get_rooms_counts(rooms_counts_model,
                                                     inner_poly,
                                                     door_poly.centroid,
                                                     area)

            generated_count.add((bed_count,bath_count))
            print(f"start generating i = 0 {generated_count}")
        else:
            bed_count, bath_count = random.randint(1, 3), random.randint(1, 3)
            while (bed_count, bath_count) in generated_count:
                bed_count, bath_count = random.randint(1, 3), random.randint(1, 3)
            print(f"{bath_count}   {bed_count}")
            generated_count.add((bed_count,bath_count))
            print(f"start generating i = {i} {generated_count}")

    return generated_count


def map_sample(sample_no):
    return