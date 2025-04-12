interface KbdProps {
  keys: string[];
}

const Kbd = ({ keys }: KbdProps) => {
  return keys.map((key) => 
    <kbd className="dark:bg-gray-100/20 bg-white px-1.5 py-0.5 rounded shadow">
      {key}
    </kbd>
  );
};

export default Kbd;