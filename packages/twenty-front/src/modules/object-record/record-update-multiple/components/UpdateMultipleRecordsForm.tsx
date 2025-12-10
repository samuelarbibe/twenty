import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type UpdateMultipleRecordsState } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import { useUpdateMultipleRecordsInitialValues } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsInitialValues';
import { shouldDisplayFormMultiEditField } from '@/object-record/record-update-multiple/utils/shouldDisplayFormMultiEditField';
import styled from '@emotion/styled';
import deepEqual from 'deep-equal';
import { Section } from 'twenty-ui/layout';

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  width: auto;
`;

export type UpdateMultipleRecordsFormProps = {
  objectNameSingular: string;
  disabled?: boolean;
  values: UpdateMultipleRecordsState;
  contextStoreInstanceId: string;
  onChange: (fieldName: string, value: any) => void;
};

export const UpdateMultipleRecordsForm = ({
  objectNameSingular,
  contextStoreInstanceId,
  disabled = false,
  values,
  onChange,
}: UpdateMultipleRecordsFormProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { initialValues, loading } = useUpdateMultipleRecordsInitialValues({
    objectNameSingular,
    contextStoreInstanceId,
  });

  if (loading) return null;

  const fields = objectMetadataItem.fields.filter(
    shouldDisplayFormMultiEditField,
  );

  const inlineFieldDefinitions = fields
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    )
    .map((fieldMetadataItem) =>
      formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItem,
        objectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      }),
    );

  return (
    <StyledSection>
      {inlineFieldDefinitions.map((fieldDefinition) => {
        const fieldName = fieldDefinition.metadata.fieldName;
        const isRelation = isFieldRelation(fieldDefinition);
        const fieldNameOrRelationIdName = isRelation
          ? `${fieldName}Id`
          : fieldName;

        const initialValue = initialValues[fieldNameOrRelationIdName];
        const value = values[fieldNameOrRelationIdName] ?? initialValue;

        const handleValueChange = (newValue: any) => {
          if (deepEqual(newValue, initialValue)) {
            onChange(fieldNameOrRelationIdName, undefined);
          } else {
            onChange(fieldNameOrRelationIdName, newValue);
          }
        };

        return (
          <FormFieldInput
            key={fieldDefinition.metadata.fieldName}
            readonly={disabled}
            field={fieldDefinition}
            defaultValue={value}
            onChange={handleValueChange}
          />
        );
      })}
    </StyledSection>
  );
};
