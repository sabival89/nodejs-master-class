# Nodejs Master Class - Homework-2
TOrder placing and Payment API for Pizza Delivery Company

## Author
[Valentine Aduaka](https://github.com/sabival89)

## REST API Documentation for a pizza-delivery company

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
###### Response Codes: `200` `400` `500`
`200` `{"Message":"User was successfully created"}`    
`400` `{'Error': 'A user with that phone number already exists' | 'Missing required fields'}`  
`500` `{'Error': 'Could not create user'}`   

#### Show user
- URL: `/users?phone=5750000000`
- Method: `GET`
- Headers: (Required) `token`

###### Response Codes: `200` `400` `404` `403`
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

###### Response Codes: `200` `500` `404` `403` `400`
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
###### Response Codes: `200` `400` `500`
`200` `{'Message': 'Menu item was successfully created'}`    
`400` `{'Error': 'Could not open menu for reading' | 'Missing required field(s)'}`  
`500` `{'Error': 'Could not update the menu'}`  

#### Show menu
- URL: `/menu`
- Method: `GET`
- Headers: (Required) `token`

###### Response Codes: `200` `400` `403`  
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
When adding items to cart, if the item you are adding to cart already exists, the item is rejected. The specified item can be updated using the PUT HTTP method/verb  

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
###### Response Codes: `200` `400` `403` `409` `500`
`200` `{"message": "Item was successfully added to cart"}`    
`400` `{'Error': 'Missing required field(s)' | 'Invalid token provided. Please login to access this page' | 'Could not open menu for reading' | 'The item you specified doesn\'t exist in the menu'}`  
`500` `{'Error': 'Could not add item to the cart' | Could not read data from the cart}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`
`409` `{'Error': 'Item already exists in cart'}`

#### Show items in cart
- URL: `/carts`
- Method: `GET`
- Headers: (Required) `token`

###### Response Codes: `200` `400` `404` `403`
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


## Orders
#### Create an order
- URL: `/orders`
- Method: `POST`
- Headers: (Required) `token`
 
###### Response Codes: `200` `400` `403` `500`
`200` `{"id": "t77kr3jctc7km41f3to0"}`    
`400` `{'Error': 'Invalid token provided. Please login to access this page' | 'Missing required fields. Token not provided'}`  
`500` `{'Error': 'Could not add order to DB' | 'Could not create order' | 'You have no items in your cart.'}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`

#### Show all orders
- URL: `/orders`
- Method: `GET`
- Headers: (Required) `token`

###### Response Codes: `200` `400` `403`
`200`  
```
{
	"orders": [{
		"kfowfxqdhcq6ac01m4tv": {
			"orderId": "kfowfxqdhcq6ac01m4tv",
			"customerId": "575XXXXXXX",
			"customerName": "Valentine Aduaka",
			"customerEmail": "a*****@live.com",
			"hasPaid": true,
			"emailSent": true,
			"items": [{
					"itemId": 1,
					"itemName": "Pepperoni with Garlic Parmesan Crust",
					"itemPrice": "19.99",
					"quantity": 1
				},
				{
					"itemId": 2,
					"itemName": "Cheese Pizza",
					"itemPrice": "9.99",
					"quantity": 2
				},
				{
					"itemId": 4,
					"itemName": "Sausage with Garlic Parmesan Crust",
					"itemPrice": "4.99",
					"quantity": 4
				}
			],
			"totalPrice": 59.93,
			"createdAt": "2020-06-15 08:43:36",
			"updatedAt": "2020-06-15 08:51:57",
			"stripe": {
				"stripeStatus": "succeeded",
				"connectionInfo": {
					"network_status": "approved_by_network",
					"reason": null,
					"risk_level": "normal",
					"risk_score": 46,
					"seller_message": "Payment complete.",
					"type": "authorized"
				}
			}
		}
	},
	{ ... }
	]
}
```
`400` `{'Error': 'You have no existing orders' | 'Invalid token provided. Please login to access this page' | 'Missing required field(s)'}`    
`403` `{'Error': 'Authentication token is not provided or is invalid'}`  

#### Show order by ID
- URL: `/orders?id=<orderId>`
- Method: `GET`
- Headers: (Required) `token`

###### Response Codes: `200` `400` `403`
`200` `{"id": "t77kr3jctc7km41f3to0"}`    
`400` `{'Error': 'The order id does not exist' | 'Order table for user not found' | 'Invalid token provided. Please login to access this page' | 'Missing required fields. Token not provided'}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`


## Checkout
#### Create - Add items to cart
- URL: `/checkout`
- Method: `POST`
- Body: (Required): `orderId`
- Headers: (Required) `token`
  
###### Response Codes: `200` `400` `403` `401` `500`
`200` `{"message": 'Your order was successful'}`    
`400` `{'Error': 'Missing required field(s)' | 'Invalid token provided. Please login to access this page' | "This order has already been fulfilled. Please contact support."}`  
`500` `{'Error': 'Order Id not found' | 'Failed to update order database' | 'Failed to delete cart data'}`  
`403` `{'Error': 'Authentication token is not provided or is invalid'}`
`401` `{'Error': 'Could not process payment,' | 'Could not send email'}`


## Login
#### User log in
- URL: `/login`
- Method: `POST`
- Body: (Required): `phone` `password`
 
###### Response Codes: `200` `400` `401` `500`
`200` 
```
{
    "phone": "57XXXXXXXX",
    "id": "of0u4krass8yhcc3wcrl",
    "expires": 1592283857676
}
```
`400` `{'Error': 'User not found' | 'Missing required fields'}`  
`401` `{'Error': 'Invalid password'}`  
`500` `{'Error': 'Could not create token for user'}`  


## Logout
#### User logout
- URL: `/logout`
- Method: `POST`
- Header: (Required): `token`
 
###### Response Codes: `200` `400` `401` `500`
`200` `{'Message': 'You successfulty logged out'}`
`400` `{'Error': 'Token does not exist' | 'Token not provided'}`  
`403` `{'Error': 'Authentication token is invalid'}`  
`500` `{'Error': 'An error occurred while trying to log you out'}`  


## Installation Guide
1. Clone the project repository 
2. Move to root dir  

```
cd homework-2
```  
3. Start the server
```  
MAILGUN_KEY=<your-mailgun-key> STRIPE_KEY=<your-stripe-key> node index.js 
```
