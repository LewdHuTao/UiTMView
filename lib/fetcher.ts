import fetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

export default fetchWithCookies;
