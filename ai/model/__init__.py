import torch
from model.cnn_models import (CentroidRegressor, XXYYRegressor,
                              BedBathCountsRegressor)

# loading models

# loading centroid model
regressor_model = CentroidRegressor()
# torch.save(regressor_model.state_dict(), 'centroid_regressor_state_dict.pth')
regressor_model.load_state_dict(
    torch.load('centroid_regressor_state_dict.pth')
)
regressor_model.eval()
#
# # loading boundaries model
boundaries_model = XXYYRegressor()
# torch.save(boundaries_model.state_dict(), 'xxyy_model_state_dict.pth')
boundaries_model.load_state_dict(
    torch.load("xxyy_model_state_dict.pth")
)
boundaries_model.eval()
#
# # count regressor model
rooms_counts_model = BedBathCountsRegressor()
# torch.save(rooms_counts_model.state_dict(), 'rooms_count_model.pth')
rooms_counts_model.load_state_dict(
    torch.load("rooms_count_model.pth",
               map_location=torch.device('cpu'))
)
