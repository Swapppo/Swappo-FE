import { ItemResponse } from '../types/catalog.types';

export const mapDummyItemToItemResponse = (
  item: any,
  index: number
): ItemResponse => {
  return {
    id: index + 1,                 
    name: item.title,              
    description: item.description,
    category: item.category,
    image_urls: item.images,       
    location_lat: 59.3293,         
    location_lon: 18.0686,
    owner_id: item.owner,          
    status: item.available
      ? "active"
      : "swapped",
    created_at: item.created_at,
    updated_at: item.created_at,
  };
};
