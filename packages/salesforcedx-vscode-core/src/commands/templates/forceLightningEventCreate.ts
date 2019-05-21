/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Command,
  SfdxCommandBuilder
} from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { DirFileNameSelection } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { Uri } from 'vscode';
import { nls } from '../../messages';
import { sfdxCoreSettings } from '../../settings';
import {
  CompositeParametersGatherer,
  SelectFileName,
  SelectOutputDir,
  SfdxCommandlet,
  SfdxWorkspaceChecker
} from '../commands';
import {
  BaseTemplateCommand,
  BundlePathStrategy,
  FilePathExistsChecker
} from './baseTemplateCommand';
import {
  FileInternalPathGatherer,
  InternalDevWorkspaceChecker,
  InternalSourcePathChecker
} from './internalCommandUtils';
import {
  AURA_DEFINITION_FILE_EXTS,
  AURA_DIRECTORY,
  AURA_EVENT_EXTENSION,
  AURA_METADATA_TYPE
} from './metadataTypeConstants';

export class ForceLightningEventCreateExecutor extends BaseTemplateCommand {
  public build(data: DirFileNameSelection): Command {
    const builder = new SfdxCommandBuilder()
      .withDescription(nls.localize('force_lightning_event_create_text'))
      .withArg('force:lightning:event:create')
      .withFlag('--eventname', data.fileName)
      .withFlag('--outputdir', data.outputdir)
      .withLogName('force_lightning_event_create');

    if (sfdxCoreSettings.getInternalDev()) {
      builder.withArg('--internal');
    }

    return builder.build();
  }

  public sourcePathStrategy = new BundlePathStrategy();

  public getDefaultDirectory() {
    return AURA_DIRECTORY;
  }

  public getFileExtension() {
    return AURA_EVENT_EXTENSION;
  }
}

const fileNameGatherer = new SelectFileName();
const outputDirGatherer = new SelectOutputDir(AURA_DIRECTORY, true);

export async function forceLightningEventCreate() {
  const commandlet = new SfdxCommandlet(
    new SfdxWorkspaceChecker(),
    new CompositeParametersGatherer<DirFileNameSelection>(
      fileNameGatherer,
      outputDirGatherer
    ),
    new ForceLightningEventCreateExecutor(),
    new FilePathExistsChecker(
      AURA_DEFINITION_FILE_EXTS,
      new BundlePathStrategy(),
      nls.localize('aura_bundle_message_name')
    )
  );
  await commandlet.run();
}

export async function forceInternalLightningEventCreate(sourceUri: Uri) {
  const commandlet = new SfdxCommandlet(
    new InternalDevWorkspaceChecker(),
    new CompositeParametersGatherer(
      fileNameGatherer,
      new FileInternalPathGatherer(sourceUri)
    ),
    new ForceLightningEventCreateExecutor(),
    new InternalSourcePathChecker(AURA_METADATA_TYPE)
  );
  await commandlet.run();
}
