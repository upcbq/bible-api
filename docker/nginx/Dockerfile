FROM nginx:mainline-alpine

ARG HOSTNAME
ENV HOSTNAME ${HOSTNAME}

ARG PORT
ENV PORT ${PORT}

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/

RUN sed -i 's/$HOSTNAME/'$HOSTNAME'/' /etc/nginx/conf.d/nginx.conf
RUN sed -i 's/$PORT/'$PORT'/' /etc/nginx/conf.d/nginx.conf
