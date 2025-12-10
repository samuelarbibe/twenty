import { useContextStoreFilter } from '@/context-store/hooks/useContextStoreFilter';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { shouldDisplayFormMultiEditField } from '@/object-record/record-update-multiple/utils/shouldDisplayFormMultiEditField';
import { useMemo } from 'react';
import { AggregateOperations } from '~/generated/graphql';

export const useUpdateMultipleRecordsInitialValues = ({
  objectNameSingular,
  contextStoreInstanceId,
}: {
  objectNameSingular: string;
  contextStoreInstanceId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { graphqlFilter } = useContextStoreFilter({ contextStoreInstanceId });

  const fields = useMemo(
    () => objectMetadataItem.fields.filter(shouldDisplayFormMultiEditField),
    [objectMetadataItem],
  );

  const recordGqlFieldsAggregate = useMemo(() => {
    return fields.reduce((acc, field) => {
      if(!isFieldRelation(field) || isFieldRelationManyToOne(field)) {
        acc[field.name] = [AggregateOperations.COUNT_UNIQUE_VALUES];
      }
      return acc;
    }, {} as Record<string, [AggregateOperations]>);
  }, [fields]);

  const { data: aggregateData, loading: isLoadingAggregate } =
    useAggregateRecords({
      objectNameSingular,
      filter: graphqlFilter,
      recordGqlFieldsAggregate,
      skip: !graphqlFilter,
    });

  const { records: sampleRecords, loading: isLoadingSampleRecords } =
    useFindManyRecords({
      objectNameSingular,
      filter: graphqlFilter,
      skip: !graphqlFilter,
      limit: 1,
    });

  const initialValues = useMemo(() => {
    if (!aggregateData || !sampleRecords) return {};

    const values: Record<string, any> = {};

    fields.forEach((field) => {
      const fieldName = field.name;
      const aggregateResult = aggregateData[fieldName];

      if (aggregateResult) {
        const count = aggregateResult[AggregateOperations.COUNT_UNIQUE_VALUES];
        const isRelation = isFieldRelation(field);
        const fieldNameOrRelationIdName = isRelation
          ? `${fieldName}Id`
          : fieldName;

        if (Number(count) <= 1) {
          values[fieldNameOrRelationIdName] = sampleRecords?.[0]?.[fieldNameOrRelationIdName];
        } else {
          values[fieldNameOrRelationIdName] = 'Mixed';
        }
      }
    });

    return values;
  }, [aggregateData, sampleRecords, fields]);

  return {
    initialValues,
    loading: isLoadingAggregate || isLoadingSampleRecords,
  };
};
