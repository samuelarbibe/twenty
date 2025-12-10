import { FieldMetadataType } from 'twenty-shared/types';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getSubfieldsForAggregateOperation = (
  field: FlatFieldMetadata,
): string[] | undefined => {
  if (field.type === FieldMetadataType.RELATION) {
    return ['id'];
  }

  if (!isCompositeFieldMetadataType(field.type)) {
    return undefined;
  } else {
    switch (field.type) {
      case FieldMetadataType.CURRENCY:
        return ['amountMicros', 'currencyCode'];
      case FieldMetadataType.FULL_NAME:
        return ['firstName', 'lastName'];
      case FieldMetadataType.ADDRESS:
        return [
          'addressStreet1',
          'addressStreet2',
          'addressCity',
          'addressPostcode',
          'addressState',
          'addressCountry',
          'addressLat',
          'addressLng',
        ];
      case FieldMetadataType.LINKS:
        return ['primaryLinkUrl'];
      case FieldMetadataType.ACTOR:
        return ['workspaceMemberId', 'source'];
      case FieldMetadataType.EMAILS:
        return ['primaryEmail'];
      case FieldMetadataType.PHONES:
        return [
          'primaryPhoneNumber',
          'primaryPhoneCountryCode',
          'primaryPhoneCallingCode',
        ];
      case FieldMetadataType.RICH_TEXT_V2:
        return ['blocknote', 'markdown'];
      default:
        throw new Error(`Unsupported composite field type: ${field.type}`);
    }
  }
};
