import { useContextStoreFilter } from '@/context-store/hooks/useContextStoreFilter';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

type UseUpdateMultipleRecordsActionsProps = {
  objectNameSingular: string;
  contextStoreInstanceId: string;
};

export const useUpdateMultipleRecordsActions = ({
  objectNameSingular,
  contextStoreInstanceId,
}: UseUpdateMultipleRecordsActionsProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { graphqlFilter } = useContextStoreFilter({ contextStoreInstanceId });

  const {
    incrementalUpdateManyRecords,
    isProcessing: isUpdating,
    progress,
    cancel,
  } = useIncrementalUpdateManyRecords({
    objectNameSingular,
    filter: graphqlFilter,
  });

  const updateRecords = async (fieldsToUpdate: Record<string, any>) => {
    try {
      await incrementalUpdateManyRecords(fieldsToUpdate);

      const count = progress.processedRecordCount;

      enqueueSuccessSnackBar({
        message: t`Successfully updated ${count} records`,
      });
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        return;
      }

      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update records. Please try again.',
      });
    }
  };

  return {
    updateRecords,
    isUpdating,
    progress,
    cancel,
  };
};
