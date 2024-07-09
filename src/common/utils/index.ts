
export const isNumeric = (n: any) => {
    // eslint-disable-next-line no-restricted-globals
    return n && !isNaN(parseFloat(n)) && isFinite(n);
  };

  
export const cleanObj = (obj: { [key: string]: any }) => {
    Object.keys(obj).forEach((key: string) => {
      try {
        if (obj[key] === '') {
          obj[key] = null;
        }
        if (!isNumeric(obj[key])) {
          obj[key] = JSON.parse(obj[key]);
        }
      } catch (err) {
        // do nothing
      }
    });
    return obj;
  };