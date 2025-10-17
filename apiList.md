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

- POST /request/review/accepted/:userId
- POST /request/review/rejected/:userId

## userRouter

- GET /user/connections (matches)
- GET /user/requests/recieved
- GET /user/feed (on load of page) - (GEts the profiles of other users when you refresh your feed)

  Status: ignore(left swipe), interested(right swipe), accepted, rejected

/feed?page=1&limit=10 => page 1-10
/feed?page=2&limit=10 => page 11-20
/feed?page=3&limit=10 => page 21-30
