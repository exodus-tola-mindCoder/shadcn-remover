#!/usr/bin/env node
// a CLI tool to remove Shadcn ui components from a project

import { Command, OptionValues } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { fileURLToPath } from 'url'; // Import necessary function for __dirname workaround

// --- Start: __dirname workaround for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End: __dirname workaround ---

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
const COMPONENTS_DIR: string = path.join(process.cwd(), 'src', 'components', 'ui');

// Helper function to check if the components directory exists
async function checkComponentsDir(): Promise<boolean> {
  const exists = await fs.pathExists(COMPONENTS_DIR);
  if (!exists) {
    console.error(chalk.red(`❌ Error: Directory not found: ${COMPONENTS_DIR}`));
    console.log(chalk.yellow('Please ensure you are running this command from the root of your project and the path is correct.'));
    process.exit(1);
  }
  return exists;
}

// Get a list of all component names (files/dirs) in the components/ui directory
async function getAllComponents(): Promise<string[]> {
  await checkComponentsDir();
  try {
    const entries: string[] = await fs.readdir(COMPONENTS_DIR);
    return entries
      .map(entry => entry.replace('.tsx', ''))
      .filter(entry => !entry.startsWith('.') && entry !== 'index');
  } catch (error: unknown) {
    console.error(chalk.red(`❌ Error reading components directory: ${COMPONENTS_DIR}`));
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }
    process.exit(1);
  }
}

// Remove a specific component (handles both single .tsx file and directory)
async function removeComponent(componentName: string, dryRun: boolean = false): Promise<void> {
  const componentFilePath: string = path.join(COMPONENTS_DIR, `${componentName}.tsx`);
  const componentDirPath: string = path.join(COMPONENTS_DIR, componentName);

  let removedPath: string | null = null;
  let removedType: RemovedEntityType = '';

  if (await fs.pathExists(componentDirPath)) {
    removedPath = componentDirPath;
    removedType = 'directory';
  }
  else if (await fs.pathExists(componentFilePath)) {
    removedPath = componentFilePath;
    removedType = 'file';
  }

  if (removedPath) {
    const relativePath = path.relative(process.cwd(), removedPath);
    if (dryRun) {
      console.log(chalk.yellow(`[Dry Run] Would remove ${removedType}: ${relativePath}`));
    } else {
      try {
        await fs.remove(removedPath);
        console.log(chalk.green(`Removed ${removedType}: ${relativePath}`));
      } catch (error: unknown) {
        console.error(chalk.red(`❌ Failed to remove ${removedType}: ${componentName}`));
         if (error instanceof Error) {
            console.error(error.message);
         } else {
            console.error(error);
         }
        throw error;
      }
    }
  } else {
    console.log(chalk.yellow(`❓ Component "${componentName}" not found (checked for ${componentName}.tsx and directory ${componentName})`));
    // throwing an error if not found should be treated as failure
    throw new Error(`Component not found: ${componentName}`);
  }
}

// Simple confirmation prompt
async function confirm(message: string): Promise<boolean> {
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

// Helper function to read package.json version
async function getPackageVersion(): Promise<string> {
  // Construct the path from the compiled JS file in 'dist' up to the root 'package.json'
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  try {
    // Use fs-extra's readJson which parses the JSON automatically
    const pkg = await fs.readJson(packageJsonPath);
    return pkg.version || 'unknown'; // Return version or fallback
  } catch (error: unknown) {
    console.warn(chalk.yellow(`⚠️ Could not read version from ${packageJsonPath}.`));
    // Optionally log the error for debugging: 
    console.error(error);
    return 'unknown'; // Fallback version
  }
}


// --- Main Program Setup and Execution ---
(async () => {
  try {
    const version = await getPackageVersion(); // Fetch version dynamically

    program
      .name('shadcn-remover')
      .description('Remove Shadcn UI components from your project')
      .version(version) // Set version dynamically
      .option('-d, --dry-run', 'Show what would be removed without actually removing files', false)
      .option('-a, --all', 'Attempt to remove all detected Shadcn UI components', false)
      .argument('[components...]', 'Specific component names to remove (e.g., button card dialog)')
      .action(async (components: string[], options: CLIOptions) => {
        const { dryRun, all: removeAll } = options;

        let componentsToDelete: string[] = components;

        // Determine which components to target
        if (removeAll) {
          if (components.length > 0) {
            console.log(chalk.yellow('Warning: Specific components provided along with --all flag. Ignoring specific components and removing all.'));
          }
          componentsToDelete = await getAllComponents(); // Handles internal exit on error
          if (componentsToDelete.length === 0) {
            console.log(chalk.yellow('🟡 No components found in components/ui directory.'));
            process.exit(0);
          }
          console.log(chalk.blue(`ℹ️ Attempting to remove all ${componentsToDelete.length} detected components.`));
        } else if (componentsToDelete.length === 0) {
          const allComponents: string[] = await getAllComponents(); // Handles internal exit on error
          if (allComponents.length === 0) {
            console.log(chalk.yellow('🟡 No components found to select from in components/ui directory.'));
            process.exit(0);
          }
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
        let successCount: number = 0;
        let failCount: number = 0;

        const results = await Promise.allSettled(
            componentsToDelete.map(component => removeComponent(component, dryRun))
        );

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                // Check if the component was actually found and removed/simulated
                // This requires removeComponent to potentially return a status or not log "not found" as success
                // For now, we count any non-error as success.
                successCount++;
            } else {
                // Error was already logged inside removeComponent's catch block
                failCount++;
                // Optionally log more context 
                console.error(chalk.red(`Failed processing component: ${result.reason?.message || result.reason}`));
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
      }); // End of .action()

    // Parse arguments ONLY inside the async IIFE after setup
    await program.parseAsync(process.argv); // Use parseAsync for async actions

  } catch (error) {
    // Catch any unexpected errors during setup/parsing
    console.error(chalk.red('An unexpected error occurred:'), error);
    process.exit(1);
  }
})(); // End of async IIFE


