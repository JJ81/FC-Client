  **pool & async**
  ```javascript
  pool.getConnection((err, connection) => {
    if (err) throw err;
    async.series(
      [
        // Description
        (callback) => {
          connection.query(QUERY.foo,
            [ parametes ],
            (err, rows) => {
              if (err) {
                callback(err, null);
              } else {
                callback(null, rows);
              }
            });
        }
      ],
      (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
        }
      });
  });
  ```