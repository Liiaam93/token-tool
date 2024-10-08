export const messages = [
  {
    id: 1,
    error: "Token not returned to spine",
    message:
      "Thank you for your E-mail, \nPlease return the following token(s) to the spine and reply to this email so that we can place your order. \nPASTE_TOKENS_HERE \nMany thanks",
  },
  {
    id: 2,
    error: "Token is invalid",
    message:
      "Thank you for your E-mail, \nThis is not a valid script token. Please check the token against the value printed on the script and reply with the correct bar code.\nMany thanks",
  },
  {
    id: 3,
    error: "Token already dispensed by sender",
    message:
      "Thank you for your E-mail \nThis token has been dispensed on your system, please reset and return back to the spine and notify us when complete. \nMany thanks",
  },
  {
    id: 4,
    error: "Token already ordered",
    message:
      "Thank you for your email,\nThis token was ordered on _____, if you have not received your item, please contact Wardles customer service quoting reference number _____.\nMany thanks",
  },
  {
    id: 5,
    error: "Token can't be found",
    message:
      "Thank you for your E-mail,\nThe following token(s) are showing that they can not be found.\n PASTE_TOKENS_HERE\n Please check the NHS tracker as it may have already been claimed.\nMany thanks",
  },
  {
    id: 6,
    error: "Token cancelled by prescriber",
    message:
      "Thank you for your E-mail,\nUnfortunately this token has been cancelled by the prescriber.\n Please check the NHS tracker for more information.\nMany thanks",
  },
];
