const validate = (schema, source = "body") => {
    const validSources = ["body", "params", "query"];
  
    if (!validSources.includes(source)) {
      throw new Error(`Invalid validation source: ${source}`);
    }
  
    return (req, res, next) => {
        req.body = schema.parse(req[source]);
      next();
    };
  };
  
  export default validate;