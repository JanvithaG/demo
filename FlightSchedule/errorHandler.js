const handleBadRequest = () => {
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: 'Bad Request: Invalid input format.'
        })
    };
};
 
const handleNotFound = () => {
    return {
        statusCode: 404,
        body: JSON.stringify({
            message: 'Not Found: Resource not found.'
        })
    };
};
 
const handleInternalServerError = () => {
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: 'Internal Server Error.'
        })
    };
};
 
module.exports = {
    handleBadRequest,
    handleNotFound,
    handleInternalServerError
};