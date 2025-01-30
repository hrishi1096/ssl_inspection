# ssl_inspection

## Pre-requisites:

* node
* python
* pip

**Note** - Make sure you are in the top level of this project directory before proceeding from here.

## Setup
* Open a terminal window and copy, paste and run each of the following one by one.
* `pip install -r requirements.txt` - Installs all the required packages for python
* `npm install` - Installs all the required packages for node
* ```
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key -out localhost.crt \
  -subj "/CN=localhost" \
  -addext "subjectAltName = DNS:localhost, IP:127.0.0.1"
  ```
  Creates a certificate file for localhost. This will be used when we start a server.
* If you have done everything correctly until this point, you should have two files - `localhost.key` and `localhost.crt` in the top level project directory
* Start the server then by running `node start_server.js`
* If it starts successfully, it should show a message like:
  ```
  [ 'Server received: All glory to WebSockets!' ]
  ```
* You can also verify this by going to `https://localhost:52525` on Chrome.
  It will say there is a self signed certificate, click on advanced and proceed.
  It should show a message which says:
  ```
  WebSocket server is running
  ```  

Awesome so far! 

Now, open a new terminal window and navigate to the same project.

## Scenario 1 - generate [SSL: CERTIFICATE_VERIFY_FAILED] error

* Run `python 1_no_cert_test.py`
* You'll get the expected error, something like:
  ```
  Error: HTTPSConnectionPool(host='localhost', port=52525): Max retries exceeded with url: / (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self signed certificate (_ssl.c:1129)')))
  ```

## Scenario 2 - connect successfully by disabling ssl certificate verification
* Run `python 2_disable_ssl.py`
* You'll get a successful response with a warning as expected, something like:
```
InsecureRequestWarning: Unverified HTTPS request is being made to host 'localhost'. Adding certificate verification is strongly advised. See: https://urllib3.readthedocs.io/en/1.26.x/advanced-usage.html#ssl-warnings
  warnings.warn(
Response Status Code: 200
Response Body: WebSocket server is running
```
  
## Scenario 3 - connect successfully by passing in the right certificate
* Then run `python 3_cert_test.py`
* It should respond with:
  ```
  Response Status Code: 200
  Response Body: WebSocket server is running
  ```
* That's how the right certificate is passed to the process and it makes the connection successfully.
* If it still fails for some reason, you can try adding an environment variable `export SSL_CERT_FILE="path/to/localhost.crt"`



Happy days!
Bye :) 



