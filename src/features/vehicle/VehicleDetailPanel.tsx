import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

// --- UI 컴포넌트 임포트 ---
import { SlidePanel } from '@/components/ui/modal/slide-panel/SlidePanel';
import { BasicButton } from '@/components/ui/button/BasicButton';
import { Badge } from '@/components/ui/badge/Badge';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { Text } from '@/components/ui/text/Text';
import { TextArea } from '@/components/ui/input/textarea/TextArea';

// --- 스타일드 컴포넌트 임포트 ---
import {
  PanelWrapper,
  PanelSection,
  PanelRowContainer,
  PanelRowSection,
  PanelLabelContainer,
  PanelValueContainer,
  AnimatedSection,
  MapContainer,
} from '@/components/ui/modal/slide-panel/SlidePanel.styles';

// --- 타입 및 훅 임포트 ---
import { useConfirm } from '@/hooks/useConfirm';
import { FUEL_TYPE_OPTIONS, TRANSMISSION_TYPE_OPTIONS } from './types';
import { useDetailPanel } from './hooks/useVehicleDetail';
import type { Vehicle } from './types';

// --- VehicleDetailPanel 컴포넌트 props ---
interface VehicleDetailPanelProps {
  vehicleId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessSave?: () => void;
}

/**
 * 차량 상세 정보를 표시하고, 편집 및 삭제 기능을 제공하는 슬라이드 패널 컴포넌트입니다.
 */
export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({
  vehicleId,
  isOpen,
  onClose,
  onSuccessSave,
}) => {
  const { confirm } = useConfirm();

  // -----------------------------------------------------------------------
  // 🚀 상세 패널 훅으로부터 상태 및 함수 가져오기
  // -----------------------------------------------------------------------
  const { selectedItem, openPanel, closePanel, isLoadingDetail, handleUpdateVehicle, handleDeleteVehicle } =
    useDetailPanel();

  // --- UI 모드 및 편집 데이터 상태 관리 ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);

  // --- useEffect: 패널 열림/닫힘 및 데이터 로딩 제어 ---
  useEffect(() => {
    if (isOpen && vehicleId !== null) {
      openPanel(vehicleId);
      setIsEditMode(false);
    } else if (!isOpen) {
      closePanel();
      setEditedVehicle(null);
      setIsEditMode(false);
    }
  }, [isOpen, vehicleId, openPanel, closePanel]);

  // --- useEffect: 불러온 상세 정보로 편집 데이터 초기화 ---
  useEffect(() => {
    if (selectedItem) {
      setEditedVehicle(selectedItem);
    }
  }, [selectedItem]);

  // -----------------------------------------------------------------------
  // 핸들러 함수들
  // -----------------------------------------------------------------------

  /**
   * '편집' 버튼 클릭 시 편집 모드로 전환합니다.
   */
  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  /**
   * '삭제' 버튼 클릭 시 차량 삭제를 처리합니다.
   * 사용자 확인 후 API를 호출하고, 성공 시 패널을 닫습니다.
   */
  const handleDelete = useCallback(async () => {
    if (!editedVehicle || editedVehicle.id === undefined) {
      toast.error('삭제할 차량 정보가 유효하지 않습니다.');
      return;
    }

    const isConfirmed = await confirm({
      title: '차량 삭제',
      content: `${editedVehicle.registrationNumber}을(를) 정말 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
    });

    if (!isConfirmed) {
      return;
    }

    const success = await handleDeleteVehicle();
    if (success) {
      onSuccessSave?.();
      onClose();
    }
  }, [editedVehicle, handleDeleteVehicle, onClose, onSuccessSave, confirm]);

  /**
   * '수정' 버튼 클릭 시 차량 정보 수정을 처리합니다.
   * API를 호출하고, 성공 시 편집 모드를 종료하고 패널을 닫습니다.
   */
  const handleSave = useCallback(async () => {
    if (!editedVehicle) {
      toast.error('저장할 차량 정보가 유효하지 않습니다.');
      return;
    }

    const result = await handleUpdateVehicle(editedVehicle);
    if (result) {
      setIsEditMode(false);
      onSuccessSave?.();
      onClose();
    }
  }, [editedVehicle, handleUpdateVehicle, onClose, onSuccessSave]);

  /**
   * 편집 모드에서 '취소' 버튼 클릭 시 편집 내용을 되돌리고 편집 모드를 종료합니다.
   */
  const handleCancel = useCallback(() => {
    if (selectedItem) {
      setEditedVehicle(selectedItem);
    }
    setIsEditMode(false);
  }, [selectedItem]);

  /**
   * 슬라이드 패널이 닫힐 때 호출되며, 편집 모드를 초기화하고 패널을 닫습니다.
   */
  const handlePanelClose = useCallback(() => {
    setIsEditMode(false);
    onClose();
  }, [onClose]);

  /**
   * 입력 필드 값이 변경될 때 편집 중인 차량 데이터를 업데이트합니다.
   */
  const handleInputChange = useCallback((field: keyof Vehicle, value: string | number) => {
    setEditedVehicle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  /**
   * 차량 상태에 따른 배지 색상을 반환합니다.
   */
  const getBadgeColor = useCallback((status: string): string => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'IN_USE':
        return 'blue';
      case 'NEEDS_MAINTENANCE':
        return 'red';
      default:
        return 'gray';
    }
  }, []);

  // --- 패널 하단 액션 버튼 렌더링 (메모이제이션) ---
  const panelActions = useMemo(() => {
    if (isLoadingDetail || !selectedItem) {
      return null;
    }

    return (
      <>
        {isEditMode ? (
          <>
            <BasicButton onClick={handleCancel} buttonType="basic">
              취소
            </BasicButton>
            <BasicButton onClick={handleSave} buttonType="primary">
              수정
            </BasicButton>
          </>
        ) : (
          <>
            <BasicButton onClick={handleEdit} buttonType="primary">
              편집
            </BasicButton>
            <BasicButton onClick={handleDelete} buttonType="primary">
              삭제
            </BasicButton>
          </>
        )}
      </>
    );
  }, [isEditMode, selectedItem, isLoadingDetail, handleEdit, handleDelete, handleSave, handleCancel]);

  /**
   * 패널의 각 정보 로우를 렌더링하는 헬퍼 함수입니다.
   * 편집 모드에 따라 텍스트 또는 입력 필드를 조건부로 표시합니다.
   */
  const renderPanelRow = useCallback(
    (label: string, text: string | number | undefined, element: React.ReactNode) => (
      <PanelRowContainer>
        <PanelLabelContainer>
          <Text type="label">{label}</Text>
        </PanelLabelContainer>
        <PanelValueContainer>
          <AnimatedSection $isVisible={isEditMode} $maxHeight="40px">
            {element}
          </AnimatedSection>
          <AnimatedSection $isVisible={!isEditMode} $maxHeight="40px">
            <Text type="body2">{text}</Text>
          </AnimatedSection>
        </PanelValueContainer>
      </PanelRowContainer>
    ),
    [isEditMode]
  );

  /**
   * 패널의 실제 내용을 렌더링하는 함수입니다.
   * 로딩, 또는 데이터 유무에 따라 다른 메시지를 표시하거나, 상세 정보를 렌더링합니다.
   */
  const renderPanelContent = () => {
    if (isLoadingDetail) {
      return (
        <PanelWrapper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Text type="body1">상세 정보를 불러오는 중입니다...</Text>
        </PanelWrapper>
      );
    }

    if (!editedVehicle) {
      return (
        <PanelWrapper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Text type="body1">차량 정보를 찾을 수 없습니다.</Text>
        </PanelWrapper>
      );
    }

    return (
      <PanelWrapper>
        <PanelSection>
          <PanelRowSection>
            <Text type="subheading">{editedVehicle.registrationNumber}</Text>
            <Badge $badgeColor={getBadgeColor(editedVehicle.status)}>{editedVehicle.statusName}</Badge>
          </PanelRowSection>
        </PanelSection>

        {/* --- 기본 정보 섹션 --- */}
        <PanelSection>
          <Text type="subheading2">기본 정보</Text>
          {renderPanelRow(
            '제조사',
            editedVehicle.manufacturer,
            <TextInput
              id="manufacturer"
              value={editedVehicle.manufacturer}
              placeholder="제조사를 입력하세요"
              width="300px"
              onChange={value => handleInputChange('manufacturer', value)}
            />
          )}
          {renderPanelRow(
            '모델명',
            editedVehicle.modelName,
            <TextInput
              id="modelName"
              value={editedVehicle.modelName}
              placeholder="모델명을 입력하세요"
              width="300px"
              onChange={value => handleInputChange('modelName', value)}
            />
          )}
          {renderPanelRow(
            '연식',
            editedVehicle.modelYear,
            <TextInput
              id="modelYear"
              value={editedVehicle.modelYear}
              placeholder="연식을 입력하세요"
              width="300px"
              onChange={value => handleInputChange('modelYear', value)}
            />
          )}
        </PanelSection>

        {/* --- 기술 정보 섹션 --- */}
        <PanelSection>
          <Text type="subheading2">기술 정보</Text>
          {renderPanelRow(
            '배터리 전력',
            editedVehicle.batteryVoltage,
            <TextInput
              id="batteryVoltage"
              value={editedVehicle.batteryVoltage ?? ''}
              placeholder="배터리 전력을 입력하세요"
              width="300px"
              onChange={value => handleInputChange('batteryVoltage', value)}
            />
          )}
          {renderPanelRow(
            '연료 유형',
            editedVehicle.fuelType,
            <Dropdown
              id="fuelType"
              options={FUEL_TYPE_OPTIONS}
              value={editedVehicle.fuelType}
              placeholder="연료 유형을 선택하세요"
              width="300px"
              onSelect={value => handleInputChange('fuelType', value.toString())}
            />
          )}
          {renderPanelRow(
            '변속기',
            editedVehicle.transmissionType,
            <Dropdown
              id="transmissionType"
              options={TRANSMISSION_TYPE_OPTIONS}
              value={editedVehicle.transmissionType}
              placeholder="변속기를 선택하세요"
              width="300px"
              onSelect={value => handleInputChange('transmissionType', value.toString())}
            />
          )}
        </PanelSection>

        {/* --- 현재 위치 섹션 (보기 모드에서만 표시) --- */}
        <AnimatedSection $isVisible={!isEditMode} $maxHeight="500px" $duration="0.3s">
          <PanelSection>
            <Text type="subheading2">현재 위치</Text>
            <MapContainer>지도</MapContainer>
          </PanelSection>
        </AnimatedSection>

        {/* --- 추가 정보 섹션 --- */}
        <PanelSection>
          <Text type="subheading2">추가 정보</Text>
          <AnimatedSection $isVisible={isEditMode} $maxHeight="200px">
            <TextArea
              id="memo"
              label="특이사항"
              placeholder="차량에 대한 특이사항을 입력하세요"
              onChange={value => handleInputChange('memo', value)}
              value={editedVehicle.memo ?? ''}
              minHeight="120px"
            />
          </AnimatedSection>
          <AnimatedSection $isVisible={!isEditMode} $maxHeight="200px">
            <TextArea
              id="memo"
              label="특이사항"
              placeholder="차량에 대한 특이사항을 입력하세요"
              onChange={value => handleInputChange('memo', value)}
              value={editedVehicle.memo ?? ''}
              minHeight="120px"
              disabled
            />
          </AnimatedSection>
        </PanelSection>
      </PanelWrapper>
    );
  };

  // --- 최종 렌더링 ---
  return (
    <SlidePanel isOpen={isOpen} onClose={handlePanelClose} title="차량 상세 정보" actions={panelActions}>
      {renderPanelContent()}
    </SlidePanel>
  );
};
