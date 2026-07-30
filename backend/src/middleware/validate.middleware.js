const validate = (schema, source = "body") => {
  const validSources = ["body", "params", "query"];

  if (!validSources.includes(source)) {
    throw new Error(`Invalid validation source: ${source}`);
  }

  return (req, res, next) => {
    const parsedData = schema.parse(req[source]);

    req.validated ??= {};
    req.validated[source] = parsedData;

    next();
  };
};

export default validate;