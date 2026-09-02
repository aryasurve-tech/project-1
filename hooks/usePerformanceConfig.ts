'use client';

import { useMemo } from 'react';
import { useDeviceType } from './useDeviceType';
import { performanceConfig } from '@/constants/design';

export function usePerformanceConfig() {
  const deviceType = useDeviceType();

  return useMemo(() => {
    switch (deviceType) {
      case 'mobile':
        return performanceConfig.mobile;
      case 'tablet':
        return performanceConfig.tablet;
      default:
        return performanceConfig.desktop;
    }
  }, [deviceType]);
}