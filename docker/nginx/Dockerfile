FROM jonasal/nginx-certbot:latest as certbot
FROM nginx:mainline-alpine

COPY --from=certbot /etc/nginx/conf.d/* /etc/nginx/conf.d

ARG HOSTNAME
ENV HOSTNAME ${HOSTNAME}

ARG PORT
ENV PORT ${PORT}

COPY ./nginx.conf /etc/nginx/conf.d/

RUN sed -i 's/$HOSTNAME/'$HOSTNAME'/g' /etc/nginx/conf.d/nginx.conf
RUN sed -i 's/$PORT/'$PORT'/g' /etc/nginx/conf.d/nginx.conf
