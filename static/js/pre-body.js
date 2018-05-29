
if (/(www\.|)tweedentity\.com$/.test(location.host) &&  location.protocol === 'http:') {
    location = 'https://tweedentity.com'
}
