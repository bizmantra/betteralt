/** JSON for an inline <script> (JSON-LD): escape <, > and & (and U+2028/2029) as \uXXXX so no data value can close
 *  the tag or open an HTML comment. The output is still valid JSON that parses to the same value. */
export const safeJson = (data: unknown) => JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
