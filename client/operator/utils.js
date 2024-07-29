import moment from 'moment';


export const timeStampFormat = (timestamp, format = 'YYYY/MM/DD HH:mm') => {
    if (!timestamp) {
      return null;
    }
    let newTimestamp = timestamp;
    if (typeof timestamp === 'string') {
      newTimestamp = parseInt(timestamp, 10);
    }
    if (newTimestamp) {
      if (newTimestamp > 100000000000) {
        newTimestamp /= 1000;
      }
      const date = moment.unix(newTimestamp);
      return date.format(format);
    }
    throw new Error('it is not timestamp format');
  };