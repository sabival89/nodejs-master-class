# Nodejs Master Class - Homework-2
The second assignment carried out during NodeJs training with Pirple

## Author
[Valentine Aduaka](https://github.com/sabival89)

# REST API Documentation for a pizza-delivery company

## Routes
- `/users`
- `/menu`
- `/carts`
- `/orders`
- `/checkout`
- `/login`
- `/logout`

## Users
#### Create user
- URL: `/users`
- Method: `POST`
- Body: (Required): `firstName` `lastName` `email` `phone` `password` `address`

##### Example (Body): 
```
{
    "firstName": "Valentine",
    "lastName": "Aduaka",
    "email": "emailxxxx@live.com",
    "phone": "5756XXXXXX",
    "password": "proxx-sd",
    "address": "2325 Pizza Ave"
}
```   
##### Response Codes: `200` `400` `500`
`200` `{"Message":"User was successfully created"}`    
`400` `{'Error': 'A user with that phone number already exists' | 'Missing required fields'}`  
`500` `{'Error': 'Could not create user'}`   

#### Show user
- URL: `/users?phone=5750000000`
- Method: `GET`
- Headers: (Required) `token`

##### Response Codes: `200` `400` `404` `403`
`200`  
```
{
    "firstName": "Valentine",
    "lastName": "Aduaka",
    "email": "emailxxxx@live.com",
    "phone": "5756XXXXXX",
    "address": "2325 Pizza Ave",
    "hashedPassword": "1a7b24fd97406a0c4f05cf091cfc205b4d8be03386418fc002b3be59f4f34ft"
}
```
`400` `{'Error': 'Missing required field'}`    
`404` `{'Error': 'User Doesn\'t exist'}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`  

#### Update user
- URL: `/users?phone=5750000000`
- Method: `PUT`
- Body: (Required) `firstName` `lastName` `email` `phone` `password` `address`
- Headers: (Required) `token`

##### Response Codes: `200` `500` `404` `403` `400`
`200` `{'Message': 'Your profile was successfully updated'}`  
`500` `{'Error': 'Could not update the user'}`  
`400` `{'Error': 'Missing required field' | 'Missing fields to update' | 'The specified user does not exist' }`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`  

#### Delete user
- URL: `/users?phone=5750000000`
- Method: `DELETE`
- Headers: (Required) `token`   

##### Response Codes: `200` `500` `404` `403` `400`
`200` `{'Message': 'User has been successfully deleted'}`  
`500` `{'Error': 'Could not delete the specified user'}`  
`400` `{'Error': 'Missing required field'}`  
`404` `{'Error': 'Could not find the specified user'}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`  


## Menu
#### Create Menu
- URL: `/menu`
- Method: `POST`
- Body: (Required): `itemName` `itemPrice`  
- Headers: (Required) `token`

##### Example (Body): 
```
{
    "itemName": "Salad Pie with beef sauce",
    "itemPrice": "5.99"
}
```   
##### Response Codes: `200` `400` `500`
`200` `{'Message': 'Menu item was successfully created'}`    
`400` `{'Error': 'Could not open menu for reading' | 'Missing required field(s)'}`  
`500` `{'Error': 'Could not update the menu'}`  

#### Show menu
- URL: `/menu`
- Method: `GET`
- Headers: (Required) `token`

##### Response Codes: `200` `400` `403`  
`200`  
```
[
    {
        "itemId": 1,
        "itemName": "Pepperoni with Garlic Parmesan Crust",
        "itemPrice": "19.99"
    },
    {
        "itemId": 2,
        "itemName": "Cheese Pizza",
        "itemPrice": "9.99"
    }
    ...
]
```
`400` `{'Error': 'Could not read menu items' | 'Invalid token provided. Please login to access this page' | 'Missing required fields. Token not provided'}`    
`403` `{'Error': 'Authentication token is invalid for user'}`  


## Carts
When adding items to cart, if the item you are adding to cart already exists, the irem is rejected. The specified item can be updated using the PUT HTTP method/verb  

#### Create - Add items to cart
- URL: `/carts`
- Method: `POST`
- Body: (Required): `itemId` `quantity` 
- Headers: (Required) `token`

##### Example (Body): 
```
{
	"itemId": 1,
	"quantity": 1
}
```   
##### Response Codes: `200` `400` `403` `409` `500`
`200` `{"message": "Item was successfully added to cart"}`    
`400` `{'Error': 'Missing required field(s)' | 'Invalid token provided. Please login to access this page' | 'Could not open menu for reading' | 'The item you specified doesn\'t exist in the menu'}`  
`500` `{'Error': 'Could not add item to the cart' | Could not read data from the cart}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`
`409` `{'Error': 'Item already exists in cart'}`

#### Show items in cart
- URL: `/carts`
- Method: `GET`
- Headers: (Required) `token`

##### Response Codes: `200` `400` `404` `403`
`200`  
```
[
    {
        "itemId": 1,
        "itemName": "Pepperoni with Garlic Parmesan Crust",
        "itemPrice": "19.99",
        "quantity": 1
    },
    { ... }
]
```
`400` `{'Error': 'Missing required field' | 'Invalid token provided. Please login to access this page'}`    
`404` `{'Error': 'No items found in your cart'}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`  

#### Update cart items
- URL: `/carts`
- Method: `PUT`
- Body: (Required) `itemId` `quantity`
- Headers: (Required) `token`

##### Response Codes: `200` `500` `403` `400`
`200` `{'Message': 'Item was successfully updated'}`  
`500` `{'Error': 'The item you specified doesn\'t exist' | 'Could not retrieve pizza menu' | 'Could not read cart items' | 'Item not found' | 'Could not update item in the cart'}`  
`400` `{'Error': 'Missing required field' | 'Invalid token provided. Please login to access this page' }`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`   


## Installation Guide
1. Clone the project repository 
2. Move to root dir
```
cd homework-2
```  
3. Start the server
```  
node MAILGUN_KEY=<your-mailgun-key> STRIPE_KEY=<your-stripe-key> index.js 
```
