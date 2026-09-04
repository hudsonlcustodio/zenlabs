/**
 * Injection token for the running commit SHA (cicd.md §3).
 *
 * A token rather than a constructor string: Nest instantiates controllers
 * itself, so a plain `string` parameter has nothing to resolve against.
 */
export const COMMIT_SHA = Symbol('COMMIT_SHA');
