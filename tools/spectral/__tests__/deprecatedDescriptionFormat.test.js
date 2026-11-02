import deprecatedDescriptionFormat from '../functions/deprecatedDescriptionFormat';

describe('deprecated-description-format', () => {
  it('valid: not deprecated', () => {
    const parameter = {
      name: 'encryptEBSVolume',
      in: 'query',
      description: 'Flag that indicates whether the EBS encryption feature encrypts the host root volume.',
      deprecated: false,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toBeUndefined();
  });

  it('valid: deprecated description starts with "Deprecated: "', () => {
    const parameter = {
      name: 'labels',
      in: 'query',
      description: 'Deprecated: use Resource tags instead. Collection of key-value pairs that tag the cluster.',
      deprecated: true,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toBeUndefined();
  });

  it('valid: deprecated without description', () => {
    const parameter = {
      name: 'labels',
      in: 'query',
      deprecated: true,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toBeUndefined();
  });

  it('valid: not a deprecated object', () => {
    const property = {
      type: 'string',
      description: 'Deprecated. This field is ignored.',
    };

    const result = deprecatedDescriptionFormat(property);
    expect(result).toBeUndefined();
  });

  it('invalid: deprecated description starts with "Deprecated."', () => {
    const parameter = {
      name: 'specs',
      in: 'query',
      description: 'Deprecated. `specs` will be removed in a future release.',
      deprecated: true,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toEqual([
      {
        message: expect.stringMatching(/must start with "Deprecated: "/),
      },
    ]);
  });

  it('invalid: deprecated description without Deprecated prefix', () => {
    const parameter = {
      name: 'replicationFactor',
      in: 'query',
      description: 'Number of members that belong to the replica set.',
      deprecated: true,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toEqual([
      {
        message: expect.stringMatching(/but was: "Number of members that belong to the replica set."/),
      },
    ]);
  });

  it('invalid: Deprecated only appears later in the description', () => {
    const parameter = {
      name: 'p50ExecMicros',
      in: 'query',
      description: 'The 50th percentile value of execution time in microseconds. This field is deprecated.',
      deprecated: true,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toEqual([
      {
        message: expect.stringMatching(/must start with "Deprecated: "/),
      },
    ]);
  });

  it('invalid: truncates long descriptions in the error message', () => {
    const parameter = {
      name: 'url',
      in: 'query',
      description: 'A'.repeat(200),
      deprecated: true,
    };

    const result = deprecatedDescriptionFormat(parameter);
    expect(result).toEqual([
      {
        message: expect.stringMatching(/\.\.\."$/),
      },
    ]);
  });
});
