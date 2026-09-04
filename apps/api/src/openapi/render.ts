/**
 * Renders the OpenAPI document to stdout without touching the filesystem.
 *
 * FF-18 uses this to regenerate and compare, so the check never has to write
 * into the working tree to find out whether the committed document is stale.
 */
import { renderYaml } from './generate';

process.stdout.write(renderYaml());
