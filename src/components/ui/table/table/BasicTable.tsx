import {
  StyledTableContainer,
  StyledTableInnerContent,
  StyledTableTableHeader,
  StyledTableRow,
  TableHeaderCell,
  TableHeaderSpan,
  TableDataCell,
  DataSpan,
  EmptyTableMessageRow,
} from './BasicTable.styles';
import type { TableProps, TableRowProps } from './types';

import { Badge } from '@/components/ui/badge/Badge';
import type { BadgeColorType } from '@/components/ui/badge/types';

// --- TableRow Component ---
const TableRow = <T extends object>({ data, tableHeaders, isLastRow, onRowClick }: TableRowProps<T>) => {
  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(data);
    }
  };

  return (
    <StyledTableRow onClick={handleRowClick} $isLastRow={isLastRow} $isClickable={!!onRowClick}>
      {tableHeaders.map((tableHeader, index) => {
        const valueForColor = (data as Record<string, unknown>)[tableHeader.key as string];

        const valueForDisplay = tableHeader.displayKey
          ? (data as Record<string, unknown>)[tableHeader.displayKey as string]
          : valueForColor; // displayKey가 없으면 valueForColor를 사용

        const isLastCell = index === tableHeaders.length - 1;

        let cellContent;

        if (tableHeader.type === 'badge') {
          let resolvedBadgeColor: BadgeColorType = 'grey';

          if (tableHeader.valueToBadgeColorMap) {
            resolvedBadgeColor = tableHeader.valueToBadgeColorMap[String(valueForColor)] || 'grey';
          }

          cellContent = <Badge $badgeColor={resolvedBadgeColor}>{String(valueForDisplay)}</Badge>;
        } else if (tableHeader.type === 'action') {
          cellContent = (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={e => {
                  e.stopPropagation();
                  console.log('Edit:', (data as { id?: string | number }).id);
                }}
              >
                수정
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  console.log('Delete:', (data as { id?: string | number }).id);
                }}
              >
                삭제
              </button>
            </div>
          );
        } else {
          cellContent = <DataSpan $preventWrap={tableHeader.preventWrap}>{String(valueForDisplay ?? '-')}</DataSpan>;
        }

        let flexGrow = 0;
        let flexShrink = 0;
        let flexBasis: string | 'auto';

        if (tableHeader.width === 'auto') {
          flexGrow = 1;
          flexShrink = 1;
          flexBasis = 'auto';
        } else if (tableHeader.width === 'flex') {
          flexGrow = 1;
          flexShrink = 1;
          flexBasis = '0';
        } else {
          flexGrow = 0;
          flexShrink = 0;
          flexBasis = tableHeader.width;
        }

        return (
          <TableDataCell
            key={String(tableHeader.key)} // key는 여전히 헤더의 key를 사용
            $flexGrow={flexGrow}
            $flexShrink={flexShrink}
            $flexBasis={flexBasis}
            $minWidth={tableHeader.minWidth}
            $align={tableHeader.align || 'center'}
            $isLastCell={isLastCell}
            $isLastRow={isLastRow}
          >
            {cellContent}
          </TableDataCell>
        );
      })}
    </StyledTableRow>
  );
};

// --- BasicTable Component ---
export const BasicTable = <T extends object & { id: string | number }>({
  tableHeaders,
  data,
  message = '데이터가 존재하지 않습니다.',
  onRowClick,
}: TableProps<T>) => {
  return (
    <StyledTableContainer>
      <StyledTableInnerContent>
        <StyledTableTableHeader>
          {tableHeaders.map((tableHeader, index) => {
            const isLastCell = index === tableHeaders.length - 1;

            let flexGrow = 0;
            let flexShrink = 0;
            let flexBasis: string | 'auto';

            if (tableHeader.width === 'auto') {
              flexGrow = 1;
              flexShrink = 1;
              flexBasis = 'auto';
            } else if (tableHeader.width === 'flex') {
              flexGrow = 1;
              flexShrink = 1;
              flexBasis = '0';
            } else {
              flexGrow = 0;
              flexShrink = 0;
              flexBasis = tableHeader.width;
            }

            return (
              <TableHeaderCell
                key={String(tableHeader.key)}
                $flexGrow={flexGrow}
                $flexShrink={flexShrink}
                $flexBasis={flexBasis}
                $minWidth={tableHeader.minWidth}
                $isLastCell={isLastCell}
              >
                <TableHeaderSpan>{tableHeader.label}</TableHeaderSpan>
              </TableHeaderCell>
            );
          })}
        </StyledTableTableHeader>

        {data && Array.isArray(data) && data.length > 0 ? (
          data.map((rowData: T, index: number) => (
            <TableRow<T>
              key={rowData.id}
              data={rowData}
              tableHeaders={tableHeaders}
              isLastRow={index === data.length - 1}
              onRowClick={onRowClick}
            />
          ))
        ) : (
          <EmptyTableMessageRow>
            <span>{message}</span>
          </EmptyTableMessageRow>
        )}
      </StyledTableInnerContent>
    </StyledTableContainer>
  );
};
