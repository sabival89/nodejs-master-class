# Nodejs Master Class - Homework-2
Teh second assignment carried out during NodeJs training with Pirple

## Author
[Valentine Aduaka](https://github.com/sabival89)

# REST API Documentation for a pizza-delivery company
Assignments carried out during NodeJs training with Pirple

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
- Body: (Required): `firstName`, `lastName`, `email`, `phone`, `password`, `address`

##### Example: 
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

#### Show user
- URL: `/users?phone=5750000000`
- Method: `GET`
- Headers: (Required) `token`

##### Response Codes: `200` `400` `404` `403` `400`
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
- Body: (Required) `firstName`, `lastName`, `email`, `phone`, `password`, `address`

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






## Installation Guide
1. Clone the project repository 
2. Move to root dir
```
cd homework-2
```
3. Start the server
```
nodemon MAILGUN_KEY=<your-mailgun-key> STRIPE_KEY=<your-stripe-key> index.js 
```
