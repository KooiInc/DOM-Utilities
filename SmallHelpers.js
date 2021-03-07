import {setTagPermission} from "./DOMCleanup.js";
import {createElementFromHtmlString} from "./DOM.js";
import {loop} from "./Extensions.js";

const cleanWhitespace = str => str.replace(/\s{2,}/g, " ");
const toZeroPaddedEuropeanDate = val => val.split("/").reverse().map(v => `${v}`.padStart(2, "0")).join("/");
const date2EuropeanDate = date => date.toISOString().split("T").shift().split("-").reverse().map(v => `${v}`.padStart(2, "0")).join("-");
const displayHour = h => `${h}`.padStart(2, `0`) + `:00`;
const throwIf = (assertion = false, message = `Unspecified error`, ErrorType = Error) =>
  assertion && (() => {
    throw new ErrorType(message);
  })();
const Logger = () => {
  let logEl;
  if (typeof window === "object") {
    logEl = document.querySelector("#log") || (() => {
      document.body.append(Object.assign(document.createElement('pre'), {id: "log"}));
      return document.querySelector("#log");
    })();
    return (...logLines) => logLines.forEach(s => logEl.textContent += `${s}\n`);
  } else {
    return (...logLines) => logLines.forEach(ll => console.log(`* `, ll));
  }
};
const time2Fragments = (milliseconds) => {
  milliseconds = Math.abs(milliseconds);
  let secs = Math.floor(Math.abs(milliseconds) / 1000);
  let mins = Math.floor(secs / 60);
  let hours = Math.floor(mins / 60);
  let days = Math.floor(hours / 24);
  const millisecs = Math.floor(Math.abs(milliseconds)) % 1000;

  return {
    days: days,
    hours: hours % 24,
    minutes: mins % 60,
    seconds: secs % 60,
    milliSeconds: millisecs,
  };
};
// no map or forEach, to keep it (more) speedy
const parseAllToTemplate = (objects2Parse, intoTemplate, fallback = String.fromCharCode(0)) => {
  let lines = [...Array(objects2Parse.length)];
  for (let i = 0; i < objects2Parse.length; i += 1) {
    lines[i] = parseTemplate(intoTemplate, objects2Parse[i], fallback);
  }
  return lines.join("");
};
const randomStringExtension = () => {
  let characters = [...Array(26)]
    .map((x, i) => String.fromCharCode(i + 65))
    .concat([...Array(26)].map((x, i) => String.fromCharCode(i + 97)))
    .concat([...Array(10)].map((x, i) => `${i}`));
  String.getRandom = (len = 12, excludes = []) => {
    const chars = excludes && characters.filter(c => !~excludes.indexOf(c)) || characters;
    return [...Array(len)]
      .map(v => chars[Math.floor(Math.random() * chars.length)])
      .join("");
  };
}
const repeat = (str, n) => Array(n).join(str);
const parseTemplate = (template, valuesMapping, fallback = String.fromCharCode(0)) =>
  template.replace(/{[^}]+}/g, (match) =>
    valuesMapping[match.slice(1, -1)] || fallback || match);
const addCssIfNotAlreadyAdded = (cssId, styleSheetLocation) => {
  const fileOrigin = /^file:/i.test(location.href);
  setTagPermission("link", true);
  if (![...document.styleSheets].find(sheet => sheet.id === cssId)) {
    const cssLink = createElementFromHtmlString(`
        <link id="${cssId}" href="${fileOrigin ? "https:" : ""}${styleSheetLocation}" rel="stylesheet"/>`);
    document.querySelector("head").appendChild(cssLink);
  }
  setTagPermission("link", false);
};
/* Generic prototype initializer */
const initializePrototype = (ctor, extensions) => {
  Object.entries(extensions).forEach(([key, lambda]) => {
    ctor.prototype[key] = function (...args) {
      return lambda.fn
        ? lambda.fn(this, ...args)
        : loop(this, el => lambda(el, ...args));
    };
  });
  ctor.prototype.isSet = true;
};
// init default values from parameters, allowing to
// maintain falsy values (like null or 0) if applicable
const initDefault = (value, defaultValue, ...includeFalsies) => {
  const empty = value => includeFalsies &&
  includeFalsies.filter(v =>
    value !== undefined && isNaN(value) ? isNaN(v) : v === value)
    .length ?
    false :
    Boolean(value) === false;
  return empty(value) ? defaultValue : value;
};
const importAsync = (url, callback) => import(url).then(callback);

export {
  cleanWhitespace,
  toZeroPaddedEuropeanDate,
  date2EuropeanDate,
  displayHour,
  throwIf,
  Logger,
  time2Fragments,
  parseAllToTemplate,
  parseTemplate,
  randomStringExtension,
  addCssIfNotAlreadyAdded,
  repeat,
  initializePrototype,
  importAsync,
};
