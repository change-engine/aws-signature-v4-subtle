export type Config = {
  service: string;
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
};

export type Request = {
  method: string;
  url: string;
  body: string;
  headers: { [key: string]: string };
};

export type BodyAndAuth = {
  body: string;
  authorization: string;
};
