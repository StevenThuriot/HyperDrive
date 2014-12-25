module.exports = function (buf) {
    if (!buf) {
        return false;
    }

    if (require('is-jpg')(buf)) {
        return 'jpeg';
    }

    if (require('is-png')(buf)) {
        return 'png';
    }

    if (require('is-gif')(buf)) {
        return 'gif';
    }
    
    return false;
};