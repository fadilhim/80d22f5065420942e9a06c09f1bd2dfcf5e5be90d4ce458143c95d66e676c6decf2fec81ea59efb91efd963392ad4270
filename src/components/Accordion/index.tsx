import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';


interface AccordionProps {
  number: number;
  title: string;
  isFirst: boolean;
  children: React.ReactNode;
  expanded?: boolean;
  onGoToTop: () => void;
  onToggle?: (isExpanded: boolean) => void;
}

const Accordion: React.FC<AccordionProps> = ({
  number,
  title,
  isFirst,
  children,
  expanded: controlledExpanded,
  onGoToTop,
  onToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  // Update internal state when controlled prop changes
  useEffect(() => {
    if (isControlled) {
      setInternalExpanded(controlledExpanded);
    }
  }, [isControlled, controlledExpanded]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newExpandedState = !expanded;

    if (!isControlled) {
      setInternalExpanded(newExpandedState);
    }

    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <View style={styles.numberCircle}>
          <Text style={styles.number}>{number}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.topButton}
          onPress={(e) => {
            e.stopPropagation();
            onGoToTop();
          }}
        >
          <Text style={styles.topButtonText}>{isFirst ? 'TOP' : 'Go Top'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
  },
  number: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 30,
    marginEnd: 10,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default Accordion;
