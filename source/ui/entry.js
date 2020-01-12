const OTPAuth = require("otpauth");
const { FIELD_VALUE_TYPE_NOTE, FIELD_VALUE_TYPE_OTP, FIELD_VALUE_TYPE_PASSWORD, FIELD_VALUE_TYPE_TEXT } = require("@buttercup/facades");

function renderEntryValue(value = "", valueType) {
    const { colourError, colourFigure } = require("../menu/misc.js");
    const { renderProgress } = require("./progress.js");
    const { padLine } = require("../library/format.js");
    let text;
    switch (valueType) {
        case FIELD_VALUE_TYPE_OTP: {
            try {
                const otp = OTPAuth.URI.parse(value);
                const digits = otp.generate();
                const timeLeft = otp.period - (Math.floor(Date.now() / 1000) % otp.period);
                return {
                    text: `${colourFigure(digits)} [${renderProgress(timeLeft / otp.period)}:${padLine(timeLeft, 2, "0", false)}]`,
                    refresh: true
                };
            } catch (err) {
                text = `${colourError("Error:")} ${err.message}`;
                break;
            }
        }
        case FIELD_VALUE_TYPE_NOTE:
            const [firstLine] = value.split("\n");
            text = firstLine;
            break;
        case FIELD_VALUE_TYPE_PASSWORD:
            /* falls-through */
        case FIELD_VALUE_TYPE_TEXT:
            /* falls-through */
        default:
            text = value;
            break;
    }
    return {
        text,
        refresh: false
    };
}

module.exports = {
    renderEntryValue
};
