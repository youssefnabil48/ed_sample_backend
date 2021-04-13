'use strict';
module.exports = {
    Error : {
        // Frontend redirection codes
        Redirect: {
          phoneVerification: 101,
          emailVerification: 102,
          completeLoginProfile: 103,
          completePurchaseProfile: 104
        },
        // Refer to https://www.postgresql.org/docs/8.2/errcodes-appendix.html
        Database: {
            uniqueViolation : 23505,
            foreignKeyViolation: 23503

        },
        // Refer to https://www.restapitutorial.com/httpstatuscodes.html
        Http: {
            internalServerError : 500,
            badRequest: 400,
            forbidden: 403,
            notFound: 404,
            unauthorized: 401,
            conflict: 409
        }
    }
};
