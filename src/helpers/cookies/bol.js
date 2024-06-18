export const generatePxEVar80 = () => {
    // Generate random values for journey and page
    const journey = Math.floor(Math.random() * 25) + 1; // Random number between 1 and 50
    const page = Math.floor(Math.random() * 4) + 1;   // Random number between 1 and 10

    // Construct the JSON object
    const randomValue = {
        journey: journey,
        page: page
    };

    // Convert the object to a URL-encoded JSON string
    const encodedValue = encodeURIComponent(JSON.stringify(randomValue));

    // Construct the cookie object
    const px_eVar80 = {
        name: "px_eVar80",
        value: encodedValue,
        domain: "www.bol.com",
        path: "/",
        expires: -1,
        httpOnly: false,
        secure: false
    };

    return px_eVar80;
}