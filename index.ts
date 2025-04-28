#!/usr/bin/env node
// a CLI tool to remove Shadcn ui components from a project

import { Command, OptionValues } from 'commander'; // Import OptionValues
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';

// Define an interface for the command options
interface CLIOptions extends OptionValues {
  dryRun: boolean;
  all: boolean;
}

// Define a type for the Inquirer answers when selecting components
interface ComponentSelectionAnswers {
  selectedComponents: string[];
}

// Define possible types for the removed entity
type RemovedEntityType = 'directory' | 'file' | '';

const program = new Command();

// Define the expected components directory relative to the current working directory
// Consider making this configurable in the future (e.g., via tsconfig.json or a command option)
const COMPONENTS_DIR: string = path.join(process.cwd(), 'src', 'components', 'ui');

// Helper function to check if the components directory exists
async function checkComponentsDir(): Promise<boolean> { // Added return type
  const exists = await fs.pathExists(COMPONENTS_DIR);
  if (!exists) {
    console.error(chalk.red(`❌ Error: Directory not found: ${COMPONENTS_DIR}`));
    console.log(chalk.yellow('Please ensure you are running this command from the root of your project and the path is correct.'));
    process.exit(1); // Exits the process; consider throwing an error for better composability if this were a library
  }
  return exists;
}

// Get a list of all component names (files/dirs) in the components/ui directory
async function getAllComponents(): Promise<string[]> { // Added return type
  await checkComponentsDir(); // Ensure directory exists before reading
  try {
    const entries: string[] = await fs.readdir(COMPONENTS_DIR);
    // Filter out potential non-component files if necessary, e.g., index files
    return entries
      .map(entry => entry.replace('.tsx', '')) // Remove .tsx extension if present
      .filter(entry => !entry.startsWith('.') && entry !== 'index'); // Example filter
  } catch (error: unknown) { // Type caught error as unknown
    console.error(chalk.red(`❌ Error reading components directory: ${COMPONENTS_DIR}`));
    if (error instanceof Error) {
        console.error(error.message); // Log only the message for cleaner output
    } else {
        console.error(error); // Log the raw error if it's not an Error instance
    }
    process.exit(1);
  }
}

// Remove a specific component (handles both single .tsx file and directory)
async function removeComponent(componentName: string, dryRun: boolean = false): Promise<void> { // Added parameter types and return type
  // No need to call checkComponentsDir here again if getAllComponents or the main action already called it.
  // If called independently, it might be needed.

  const componentFilePath: string = path.join(COMPONENTS_DIR, `${componentName}.tsx`);
  const componentDirPath: string = path.join(COMPONENTS_DIR, componentName);

  let removedPath: string | null = null; // Type can be string or null
  let removedType: RemovedEntityType = ''; // Use the defined union type

  // Preferentially check for a directory matching the component name
  if (await fs.pathExists(componentDirPath)) {
    removedPath = componentDirPath;
    removedType = 'directory';
  }
  // If no directory, check for a .tsx file
  else if (await fs.pathExists(componentFilePath)) {
    removedPath = componentFilePath;
    removedType = 'file';
  }

  if (removedPath) {
    const relativePath = path.relative(process.cwd(), removedPath); // Calculate once
    if (dryRun) {
      console.log(chalk.yellow(`[Dry Run] Would remove ${removedType}: ${relativePath}`));
    } else {
      try {
        await fs.remove(removedPath); // fs-extra remove handles both files and directories
        console.log(chalk.green(`Removed ${removedType}: ${relativePath}`));
      } catch (error: unknown) { // Type caught error
        console.error(chalk.red(`❌ Failed to remove ${removedType}: ${componentName}`));
         if (error instanceof Error) {
            console.error(error.message);
         } else {
            console.error(error);
         }
        // Re-throw the error to be caught by the main loop's catch block
        throw error;
      }
    }
  } else {
    // Consider making this a warning instead of red, or handle it in the main loop based on return value
    console.log(chalk.yellow(`❓ Component "${componentName}" not found (checked for ${componentName}.tsx and directory ${componentName})`));
    // Maybe throw a specific error here if not finding it should count as a failure?
    // throw new Error(`Component not found: ${componentName}`);
  }
}

// Simple confirmation prompt
async function confirm(message: string): Promise<boolean> { // Added parameter type and return type
  // Ensure @types/inquirer is installed for proper typing
  const { confirmed }: { confirmed: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: message,
      default: false,
    }
  ]);
  return confirmed;
}

program
  .name('shadcn-remover')
  .description('Remove Shadcn UI components from your project')
  .version('1.0.1') // Consider fetching version from package.json
  .option('-d, --dry-run', 'Show what would be removed without actually removing files', false) // Default value
  .option('-a, --all', 'Attempt to remove all detected Shadcn UI components', false) // Default value
  .argument('[components...]', 'Specific component names to remove (e.g., button card dialog)')
  .action(async (components: string[], options: CLIOptions) => { // Typed arguments and options
    const { dryRun, all: removeAll } = options; // Destructure options

    let componentsToDelete: string[] = components; // Explicitly type

    // Determine which components to target
    if (removeAll) {
      if (components.length > 0) {
        console.log(chalk.yellow('Warning: Specific components provided along with --all flag. Ignoring specific components and removing all.'));
      }
      // getAllComponents already handles the error case internally by exiting
      componentsToDelete = await getAllComponents();
      if (componentsToDelete.length === 0) {
        console.log(chalk.yellow('🟡 No components found in components/ui directory.'));
        process.exit(0);
      }
      console.log(chalk.blue(`ℹ️ Attempting to remove all ${componentsToDelete.length} detected components.`));
    } else if (componentsToDelete.length === 0) {
      // If no components specified via argument or --all, prompt user
      const allComponents: string[] = await getAllComponents(); // Type the result
      if (allComponents.length === 0) {
        console.log(chalk.yellow('🟡 No components found to select from in components/ui directory.'));
        process.exit(0);
      }
      // Use the defined interface for answers
      const answers: ComponentSelectionAnswers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedComponents',
          message: 'Select components to remove:',
          choices: allComponents,
          pageSize: 10,
        },
      ]);
      componentsToDelete = answers.selectedComponents;
    }

    // Exit if nothing is selected
    if (componentsToDelete.length === 0) {
      console.log(chalk.yellow('🟡 No components selected or specified for removal. Exiting.'));
      process.exit(0);
    }

    // Confirmation step
    console.log(chalk.cyan(`Selected components: ${componentsToDelete.join(', ')}`));
    const proceed: boolean = await confirm(
      dryRun
        ? `Dry run: Show removal actions for ${componentsToDelete.length} component(s)?`
        : `⚠️ Are you sure you want to permanently remove ${componentsToDelete.length} component(s)?`
    );

    if (!proceed) {
      console.log(chalk.gray('Operation cancelled by user.'));
      process.exit(0);
    }

    // Execution step
    const spinner = ora(dryRun ? 'Simulating component removal...' : 'Removing components...').start();
    let successCount: number = 0; // Explicit type
    let failCount: number = 0; // Explicit type

    // Use Promise.allSettled for potentially better concurrency and error handling
    const results = await Promise.allSettled(
        componentsToDelete.map(component => removeComponent(component, dryRun))
    );

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            // If removeComponent doesn't throw an error on "not found",
            // we might need a way to distinguish success from not-found here.
            // Currently, any non-throwing execution is counted as success.
            successCount++;
        } else {
            // Error was already logged inside removeComponent's catch block
            failCount++;
            // Optionally log more context here if needed:
            // console.error(chalk.red(`Failed processing component: ${result.reason}`));
        }
    });


    // Update spinner based on results
    if (failCount > 0) {
      spinner.warn(chalk.yellow(`Completed with ${failCount} error(s). ${successCount} component(s) processed.`));
    } else if (dryRun) {
      spinner.succeed(chalk.green(`Dry run complete. ${successCount} component(s) simulated for removal.`));
    } else {
      spinner.succeed(chalk.green(`Successfully removed ${successCount} component(s).`));
    }

    if (failCount > 0) {
      process.exit(1); // Exit with error code if any component removal failed
    }
  });

// Helper function to read package.json version (Optional but good practice)
// async function getPackageVersion(): Promise<string> {
//     try {
//         const pkg = await fs.readJson(path.join(__dirname, '..', 'package.json')); // Adjust path if needed
//         return pkg.version || 'unknown';
//     } catch {
//         return 'unknown';
//     }
// }

// (async () => {
//     // const version = await getPackageVersion(); // Fetch version dynamically
//     // program.version(version); // Set version dynamically
//     program.parse(process.argv);
// })(); // Use async IIFE if you need top-level await for version fetching

program.parse(process.argv); // Pass arguments explicitly (Simpler if not fetching version async)

