# API List

## authRouter

- POST /signup
- POST /login
- POST /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter

- POST /request/send/interested/:userId
- POST /request/send/ignore/:userId

- POST /request/send/accepted/:userId
- POST /request/send/rejected/:userId

## userRouter

- GET /user/connections (matches)
- GET /user/requests/recieved
- GET /user/feed (on load of page) - (GEts the profiles of other users when you refresh your feed)

  Status: ignore(left swipe), interested(right swipe), accepted, rejected
