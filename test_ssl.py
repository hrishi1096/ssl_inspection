import requests

CERT_PATH = "./localhost.crt"  # Adjust based on your OS

def make_request(url):
    try:
        response = requests.get(url, timeout=10, verify=CERT_PATH)
        response.raise_for_status()
        print("Response Status Code:", response.status_code)
        print("Response Body:", response.text)
    except requests.exceptions.RequestException as err:
        print("Error:", err)

if __name__ == "__main__":
    url = "https://localhost:52525"
    make_request(url)

