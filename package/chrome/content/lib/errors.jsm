this.EXPORTED_SYMBOLS = [];

this.EXPORTED_SYMBOLS.push("GPGError");
function GPGError(message) {
    this.message = message;
    this.typeString = "GPG Error";
}

this.EXPORTED_SYMBOLS.push("TypeError");
function TypeError(message) {
    this.message = message;
    this.typeString = "Type Error";
}

this.EXPORTED_SYMBOLS.push("gpgStderrThrow");
function gpgStderrThrow(data) {
    throw new GPGError(data);
}
