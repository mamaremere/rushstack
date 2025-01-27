// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import {
  ConsoleTerminalProvider,
  StringBufferTerminalProvider,
  Terminal
} from '@rushstack/node-core-library';
import { RushSession } from '@microsoft/rush-lib';

import { AzureEnvironmentNames, AzureStorageBuildCacheProvider } from '../AzureStorageBuildCacheProvider';

const rushSession = new RushSession({
  terminalProvider: new ConsoleTerminalProvider(),
  getIsDebugMode: () => false
});

const { EnvironmentConfiguration, RushUserConfiguration, CredentialCache } = rushSession;

describe('AzureStorageBuildCacheProvider', () => {
  beforeEach(() => {
    jest.spyOn(EnvironmentConfiguration, 'buildCacheCredential', 'get').mockReturnValue(undefined);
    jest.spyOn(EnvironmentConfiguration, 'buildCacheEnabled', 'get').mockReturnValue(undefined);
    jest.spyOn(EnvironmentConfiguration, 'buildCacheWriteAllowed', 'get').mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uses a correct list of Azure authority hosts', async () => {
    await expect(
      () =>
        new AzureStorageBuildCacheProvider(
          {
            storageAccountName: 'storage-account',
            storageContainerName: 'container-name',
            azureEnvironment: 'INCORRECT_AZURE_ENVIRONMENT' as AzureEnvironmentNames,
            isCacheWriteAllowed: false
          },
          rushSession
        )
    ).toThrowErrorMatchingSnapshot();
  });

  describe('isCacheWriteAllowed', () => {
    function prepareSubject(
      optionValue: boolean,
      envVarValue: boolean | undefined
    ): AzureStorageBuildCacheProvider {
      jest.spyOn(EnvironmentConfiguration, 'buildCacheWriteAllowed', 'get').mockReturnValue(envVarValue);
      return new AzureStorageBuildCacheProvider(
        {
          storageAccountName: 'storage-account',
          storageContainerName: 'container-name',
          isCacheWriteAllowed: optionValue
        },
        rushSession
      );
    }

    it('is false if isCacheWriteAllowed is false', () => {
      const subject: AzureStorageBuildCacheProvider = prepareSubject(false, undefined);
      expect(subject.isCacheWriteAllowed).toBe(false);
    });

    it('is true if isCacheWriteAllowed is true', () => {
      const subject: AzureStorageBuildCacheProvider = prepareSubject(true, undefined);
      expect(subject.isCacheWriteAllowed).toBe(true);
    });

    it('is false if isCacheWriteAllowed is true but the env var is false', () => {
      const subject: AzureStorageBuildCacheProvider = prepareSubject(true, false);
      expect(subject.isCacheWriteAllowed).toBe(false);
    });

    it('is true if the env var is true', () => {
      const subject: AzureStorageBuildCacheProvider = prepareSubject(false, true);
      expect(subject.isCacheWriteAllowed).toBe(true);
    });
  });

  async function testCredentialCache(isCacheWriteAllowed: boolean): Promise<void> {
    const cacheProvider: AzureStorageBuildCacheProvider = new AzureStorageBuildCacheProvider(
      {
        storageAccountName: 'storage-account',
        storageContainerName: 'container-name',
        isCacheWriteAllowed
      },
      rushSession
    );

    // Mock the user folder to the current folder so a real .rush-user folder doesn't interfere with the test
    jest.spyOn(RushUserConfiguration, 'getRushUserFolderPath').mockReturnValue(__dirname);
    let setCacheEntryArgs: unknown[] = [];
    const credentialsCacheSetCacheEntrySpy: jest.SpyInstance = jest
      .spyOn(CredentialCache.prototype, 'setCacheEntry')
      .mockImplementation((...args) => {
        setCacheEntryArgs = args;
      });
    const credentialsCacheSaveSpy: jest.SpyInstance = jest
      .spyOn(CredentialCache.prototype, 'saveIfModifiedAsync')
      .mockImplementation(() => Promise.resolve());

    const terminal: Terminal = new Terminal(new StringBufferTerminalProvider());
    await cacheProvider.updateCachedCredentialAsync(terminal, 'credential');

    expect(credentialsCacheSetCacheEntrySpy).toHaveBeenCalledTimes(1);
    expect(setCacheEntryArgs).toMatchSnapshot();
    expect(credentialsCacheSaveSpy).toHaveBeenCalledTimes(1);
  }

  it('Has an expected cached credential name (write not allowed)', async () => {
    await testCredentialCache(false);
  });

  it('Has an expected cached credential name (write allowed)', async () => {
    await testCredentialCache(true);
  });
});
