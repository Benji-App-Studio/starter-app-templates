import { Row } from '@/components/Row';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import { Odometer } from './Odometer';
import { splitDuration } from './time';

type TimeFreeCounterProps = {
  elapsedMs: number;
  /** "Smoke-free", drawn above the number. */
  label: string;
};

/** Days as the hero number once the first day is done; hours before that. */
export function TimeFreeCounter({ elapsedMs, label }: TimeFreeCounterProps) {
  const { days, hours, minutes, seconds } = splitDuration(elapsedMs);
  const showDays = days >= 1;
  const unit = showDays ? (days === 1 ? 'day' : 'days') : hours === 1 ? 'hour' : 'hours';

  return (
    <Stack align="center" gap="md">
      <Stack align="center" gap="sm">
        <Text variant="overline" color="primary" numberOfLines={1}>
          {label.toUpperCase()}
        </Text>
        <Stack align="center" gap="none">
          <Odometer value={showDays ? days : hours} />
          <Text variant="label" color="muted">
            {unit}
          </Text>
        </Stack>
      </Stack>
      <Row gap="xxs">
        {showDays ? (
          <>
            <Odometer value={hours} minDigits={2} variant="numeralSmall" color="muted" />
            <Colon />
          </>
        ) : null}
        <Odometer value={minutes} minDigits={2} variant="numeralSmall" color="muted" />
        <Colon />
        <Odometer value={seconds} minDigits={2} variant="numeralSmall" color="muted" />
      </Row>
    </Stack>
  );
}

function Colon() {
  return (
    <Text variant="numeralSmall" color="muted">
      :
    </Text>
  );
}
