import { Component, type ComponentType, type ReactNode } from 'react';
import { contracts, isBlockType, type BlockInput, type BlockType } from './contracts';
import { components } from './components';
import { BlockProvider } from './results/store';
import { ErrorCard } from './primitives/ErrorCard';

/**
 * Renders any block by type: validates props against the contract, shows a readable error card on
 * bad props or render crashes, and (with an id inside a board) wires results saving.
 */
export function Block<K extends BlockType>({ type, id, props }: { type: K | string; id?: string; props: BlockInput<K> | Record<string, unknown> }) {
  if (!isBlockType(type)) return <ErrorCard title={`Unknown block "${type}"`} lines={[`Known blocks: ${Object.keys(contracts).join(', ')}`]} />;
  const parsed = contracts[type].schema.safeParse(props ?? {});
  if (!parsed.success)
    return <ErrorCard title={`${type}${id ? ` "${id}"` : ''}: invalid props`} lines={parsed.error.issues.map((i) => `${i.path.join('.') || '(props)'}: ${i.message}`)} />;
  const C = components[type] as ComponentType<Record<string, unknown>>;
  const el = (
    <Boundary label={`${type}${id ? ` "${id}"` : ''}`}>
      <C {...(parsed.data as Record<string, unknown>)} />
    </Boundary>
  );
  return id ? <BlockProvider id={id} type={type}>{el}</BlockProvider> : el;
}

class Boundary extends Component<{ label: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) return <ErrorCard title={`${this.props.label} crashed`} lines={[this.state.error.message]} />;
    return this.props.children;
  }
}
