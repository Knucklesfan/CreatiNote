# FROM golang:1.22

# WORKDIR /usr/src/app

# COPY go.mod go.sum ./
# RUN go mod download && go mod verify

# COPY . .
# RUN go build -v -o /usr/local/bin/app ./...

# CMD ["app"]
#Stole this from the golang 
#
# go build
#
FROM golang:1.22 AS go-build

#
# here we pull pkg source directly from git (and all it's dependencies)
#
WORKDIR /usr/src/backend

COPY ./backend/go.mod ./backend/go.sum ./
RUN go mod download && go mod verify
COPY ./backend .
RUN     CGO_ENABLED=0 go build
RUN ls

#
# node build
#
FROM node:20.17.0 AS node-build

WORKDIR /usr/src/frontend
COPY ./frontend/ .

# produces static html 'dist' here:
#
#       /app/vue-go/dist
#
RUN npm install && npm ci && npm run build

#
# final layer: include just go-binary and static html 'dist' 
#
FROM scratch

COPY --from=go-build \
    /usr/src/backend/CreatiNote \
    /app/CreatiNote

COPY --from=node-build \
    /usr/src/frontend/build \
    /app/static

CMD ["/app/CreatiNote"]