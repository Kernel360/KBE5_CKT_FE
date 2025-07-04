import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  MapWrap,
} from '@/components/ui/modal/slide-panel/SlidePanel.styles';

// --- 타입 및 훅 임포트 ---
import { useConfirm } from '@/hooks/useConfirm';
import { FUEL_TYPE_OPTIONS, TRANSMISSION_TYPE_OPTIONS } from './types';
import { useDetailPanel } from './hooks/useVehicleDetail';
import { getAddressFromCoord } from '@/utils/kakao';
import type { LatLng } from '@/utils/kakao';

const KakaoMapView = ({ lat, lon }: LatLng) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const DEFAULT_KAKAO_LEVEL = 5;

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = mapRef.current;

      const options = {
        center: new window.kakao.maps.LatLng(lat, lon),
        level: DEFAULT_KAKAO_LEVEL,
      };

      const map = new window.kakao.maps.Map(container, options);

      // 마커 추가
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(lat, lon),
        image: new window.kakao.maps.MarkerImage('/icon/marker.svg', new window.kakao.maps.Size(32, 32)),
      });
    }
  }, [lat, lon]);

  return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '5px' }} />;
};

const CoordinateToAddress: React.FC<LatLng> = ({ lat, lon }) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const addr = await getAddressFromCoord(lat, lon);

        if (!addr) {
          setAddress('좌표에 해당하는 주소가 없습니다.');
        } else {
          setAddress(addr);
        }
      } catch (err) {
        console.error(err);
        setAddress('주소를 불러올 수 없습니다.');
      }
    };
    fetch();
  }, [lat, lon]);

  return <TextInput id="address" label="주소" value={address} disabled />;
};

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
  const mapRef = useRef<L.Map | null>(null);

  // -----------------------------------------------------------------------
  // 🚀 상세 패널 훅으로부터 상태 및 함수 가져오기
  // -----------------------------------------------------------------------
  const {
    selectedItem,
    geoAddress,
    formData,
    errors,
    openPanel,
    closePanel,
    isLoadingDetail,
    handleInputChange,
    initForm,
    resetForm,
    handleUpdateVehicle,
    handleDeleteVehicle,
  } = useDetailPanel();

  // --- UI 모드 및 편집 데이터 상태 관리 ---
  const [isEditMode, setIsEditMode] = useState(false);

  // --- useEffect: 패널 열림/닫힘 및 데이터 로딩 제어 ---
  useEffect(() => {
    if (isOpen && vehicleId !== null) {
      openPanel(vehicleId);
      setIsEditMode(false);
    } else if (!isOpen) {
      closePanel();
      resetForm();
      setIsEditMode(false);
    }
  }, [isOpen, vehicleId, openPanel, closePanel, resetForm]);

  // --- useEffect: 불러온 상세 정보로 편집 데이터 초기화 ---
  useEffect(() => {
    if (selectedItem) {
      initForm(selectedItem);
    }
  }, [selectedItem, initForm]);

  // -----------------------------------------------------------------------
  // 핸들러 함수들
  // -----------------------------------------------------------------------

  /**
   * 애뮬레이터 시동을 위한 페이지로 이동합니다.
   */
  const handleNavigateToEmulator = useCallback(() => {
    const baseUrl = import.meta.env.VITE_EMULATOR_SERVICE_URL;
    if (baseUrl && selectedItem?.id) {
      const targetUrl = `${baseUrl}/emulator/${selectedItem?.id}`;
      window.open(targetUrl, '_blank');
    } else {
      toast.error('시동을 할 수 없습니다.');
    }
  }, [selectedItem]);

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
    if (!selectedItem || selectedItem.id === undefined) {
      toast.error('삭제할 차량 정보가 유효하지 않습니다.');
      return;
    }

    const isConfirmed = await confirm({
      title: '차량 삭제',
      content: `${selectedItem.registrationNumber}을(를) 정말 삭제하시겠습니까?`,
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
  }, [selectedItem, handleDeleteVehicle, onClose, onSuccessSave, confirm]);

  /**
   * '수정' 버튼 클릭 시 차량 정보 수정을 처리합니다.
   * API를 호출하고, 성공 시 편집 모드를 종료하고 패널을 닫습니다.
   */
  const handleSave = useCallback(async () => {
    const result = await handleUpdateVehicle();
    if (result) {
      setIsEditMode(false);
      onSuccessSave?.();
      onClose();
    }
  }, [handleUpdateVehicle, onClose, onSuccessSave]);

  /**
   * 편집 모드에서 '취소' 버튼 클릭 시 편집 내용을 되돌리고 편집 모드를 종료합니다.
   */
  const handleCancel = useCallback(() => {
    if (selectedItem) {
      initForm(selectedItem);
    }
    setIsEditMode(false);
  }, [selectedItem, initForm]);

  /**
   * 슬라이드 패널이 닫힐 때 호출되며, 편집 모드를 초기화하고 패널을 닫습니다.
   */
  const handlePanelClose = useCallback(() => {
    setIsEditMode(false);
    onClose();
  }, [onClose]);

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
        <BasicButton onClick={handleNavigateToEmulator} buttonType="basic">
          시동 체험
        </BasicButton>
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

    if (!selectedItem) {
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
            <Text type="subheading">{selectedItem.registrationNumber}</Text>
            <Badge $badgeColor={getBadgeColor(selectedItem.status)}>{selectedItem.statusName}</Badge>
          </PanelRowSection>
        </PanelSection>

        {/* --- 기본 정보 섹션 --- */}
        <PanelSection>
          <Text type="subheading2">기본 정보</Text>
          {renderPanelRow(
            '제조사',
            selectedItem.manufacturer,
            <TextInput
              id="manufacturer"
              value={formData.manufacturer}
              placeholder="제조사를 입력하세요"
              width="300px"
              onChange={value => handleInputChange('manufacturer', value)}
              errorText={errors.manufacturer}
            />
          )}
          {renderPanelRow(
            '모델명',
            selectedItem.modelName,
            <TextInput
              id="modelName"
              value={formData.modelName}
              placeholder="모델명을 입력하세요"
              width="300px"
              onChange={value => handleInputChange('modelName', value)}
              errorText={errors.modelName}
            />
          )}
          {renderPanelRow(
            '연식',
            selectedItem.modelYear,
            <TextInput
              id="modelYear"
              value={formData.modelYear}
              placeholder="연식을 입력하세요"
              width="300px"
              onChange={value => handleInputChange('modelYear', value)}
              errorText={errors.modelYear}
            />
          )}
        </PanelSection>

        {/* --- 기술 정보 섹션 --- */}
        <PanelSection>
          <Text type="subheading2">기술 정보</Text>
          {renderPanelRow(
            '배터리 전력',
            selectedItem.batteryVoltage + 'kWh',
            <TextInput
              id="batteryVoltage"
              value={formData.batteryVoltage ?? ''}
              placeholder="배터리 전력을 입력하세요"
              width="300px"
              onChange={value => handleInputChange('batteryVoltage', value)}
              errorText={errors.batteryVoltage}
            />
          )}
          {renderPanelRow(
            '연료 유형',
            selectedItem.fuelTypeName,
            <Dropdown
              id="fuelType"
              options={FUEL_TYPE_OPTIONS}
              value={formData.fuelType}
              placeholder="연료 유형을 선택하세요"
              width="300px"
              onSelect={value => handleInputChange('fuelType', value.toString())}
              errorText={errors.fuelType}
            />
          )}
          {renderPanelRow(
            '변속기',
            selectedItem.transmissionTypeName,
            <Dropdown
              id="transmissionType"
              options={TRANSMISSION_TYPE_OPTIONS}
              value={formData.transmissionType}
              placeholder="변속기를 선택하세요"
              width="300px"
              onSelect={value => handleInputChange('transmissionType', value.toString())}
              errorText={errors.transmissionType}
            />
          )}
        </PanelSection>

        {/* --- 현재 위치 섹션 (보기 모드에서만 표시) --- */}
        <AnimatedSection $isVisible={!isEditMode} $maxHeight="500px" $duration="0.3s">
          <PanelSection>
            <Text type="subheading2">현재 위치</Text>
            {!!selectedItem.lat && !!selectedItem.lon ? (
              <>
                <KakaoMapView lat={selectedItem.lat} lon={selectedItem.lon} />
                <CoordinateToAddress lat={selectedItem.lat} lon={selectedItem.lon} />
              </>
            ) : (
              <MapWrap>현재 위치를 찾을 수 없습니다.</MapWrap>
            )}
          </PanelSection>
        </AnimatedSection>

        {/* --- 추가 정보 섹션 --- */}
        <PanelSection>
          <AnimatedSection $isVisible={isEditMode} $maxHeight="200px">
            <TextArea
              id="memo"
              label="특이사항"
              placeholder="차량에 대한 특이사항을 입력하세요"
              onChange={value => handleInputChange('memo', value)}
              value={formData.memo ?? ''}
              minHeight="120px"
              errorText={errors.memo}
            />
          </AnimatedSection>
          <AnimatedSection $isVisible={!isEditMode} $maxHeight="200px">
            <TextArea
              id="memo"
              label="특이사항"
              placeholder="차량에 대한 특이사항을 입력하세요"
              onChange={value => handleInputChange('memo', value)}
              value={selectedItem.memo ?? ''}
              minHeight="120px"
              disabled
              errorText={errors.memo}
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
