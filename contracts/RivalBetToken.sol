// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ═══════════════════════════════════════════════════════════════════════════
//  RivalBet Token (RB) — BEP-20 — Binance Smart Chain
// ───────────────────────────────────────────────────────────────────────────
//  Supply      : 10 000 000 RB (fixe, pas de mint)
//  Decimals    : 18
//  Buy tax     : 5%  → treasury wallet
//  Sell tax    : 5%  → treasury wallet
//  Max wallet  : 2%  (200 000 RB) — désactivable après lancement
//  Anti-bot    : trading verrouillé jusqu'à openTrading()
//  Ownership   : maintenu par le deployer
// ═══════════════════════════════════════════════════════════════════════════

contract RivalBetToken {

    // ── Identité du token ────────────────────────────────────────────────
    string  public constant name     = "RivalBet";
    string  public constant symbol   = "RB";
    uint8   public constant decimals = 18;

    // ── Supply & limites ─────────────────────────────────────────────────
    uint256 public constant TOTAL_SUPPLY = 10_000_000 * 10**18;
    uint256 public constant MAX_WALLET   =    200_000 * 10**18; // 2% du supply

    // ── Taxes (base 10 000 → 500 = 5%) ──────────────────────────────────
    uint256 private constant TAX_DENOM = 10_000;
    uint256 private constant MAX_TAX   =  1_000; // plafond 10%

    uint256 public buyTax  = 500; // 5%
    uint256 public sellTax = 500; // 5%

    // ── Adresses clés ────────────────────────────────────────────────────
    address public owner;
    address public treasury;
    address public pair;            // Pool PancakeSwap, définie à l'ouverture

    // ── États ────────────────────────────────────────────────────────────
    bool public tradingOpen  = false; // Anti-bot : bloqué jusqu'à openTrading()
    bool public limitsActive = true;  // Max wallet actif au lancement

    // ── Balances & allowances ────────────────────────────────────────────
    mapping(address => uint256)                     private _bal;
    mapping(address => mapping(address => uint256)) private _allow;

    // ── Exemptions (owner + treasury + contrat) ──────────────────────────
    // Adresses exemptées de taxes et de la limite max wallet
    mapping(address => bool) public isExempt;

    // ── Événements ──────────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TradingOpened(address indexed pair);
    event LimitsRemoved();
    event TaxUpdated(uint256 buy, uint256 sell);
    event TreasuryUpdated(address indexed treasury);
    event ExemptUpdated(address indexed account, bool exempt);
    event OwnershipTransferred(address indexed prev, address indexed next);

    // ── Modifier ─────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "RB: not owner");
        _;
    }

    // ════════════════════════════════════════════════════════════════════
    //  CONSTRUCTEUR
    //  _treasury : ton wallet personnel qui recevra les taxes
    // ════════════════════════════════════════════════════════════════════
    constructor(address _treasury) {
        require(_treasury != address(0), "RB: zero treasury");

        owner    = msg.sender;
        treasury = _treasury;

        // Exemptions initiales
        isExempt[msg.sender]    = true;
        isExempt[_treasury]     = true;
        isExempt[address(this)] = true;

        // Tout le supply vers le deployer
        _bal[msg.sender] = TOTAL_SUPPLY;
        emit Transfer(address(0), msg.sender, TOTAL_SUPPLY);
    }

    // ════════════════════════════════════════════════════════════════════
    //  BEP-20 STANDARD
    // ════════════════════════════════════════════════════════════════════

    function totalSupply() public pure returns (uint256) {
        return TOTAL_SUPPLY;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _bal[account];
    }

    function allowance(address _owner, address spender) public view returns (uint256) {
        return _allow[_owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _allow[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 allowed = _allow[from][msg.sender];
        require(allowed >= amount, "RB: allowance exceeded");
        unchecked { _allow[from][msg.sender] = allowed - amount; }
        _transfer(from, to, amount);
        return true;
    }

    // ════════════════════════════════════════════════════════════════════
    //  LOGIQUE DE TRANSFER (taxes + limites)
    // ════════════════════════════════════════════════════════════════════

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0) && to != address(0), "RB: zero address");
        require(_bal[from] >= amount, "RB: insufficient balance");

        bool exempt = isExempt[from] || isExempt[to];

        // ── Anti-bot : trading verrouillé ────────────────────────────────
        if (!exempt) {
            require(tradingOpen, "RB: trading not open yet");
        }

        uint256 tax = 0;

        if (!exempt && pair != address(0)) {

            if (from == pair) {
                // ── ACHAT (BNB → RB) ─────────────────────────────────────
                tax = amount * buyTax / TAX_DENOM;

                // Max wallet actif uniquement pendant la phase de lancement
                if (limitsActive) {
                    require(
                        _bal[to] + (amount - tax) <= MAX_WALLET,
                        "RB: max wallet exceeded"
                    );
                }

            } else if (to == pair) {
                // ── VENTE (RB → BNB) ─────────────────────────────────────
                tax = amount * sellTax / TAX_DENOM;
            }
        }

        unchecked {
            _bal[from] -= amount;

            if (tax > 0) {
                _bal[treasury] += tax;
                emit Transfer(from, treasury, tax);
            }

            _bal[to] += amount - tax;
        }

        emit Transfer(from, to, amount - tax);
    }

    // ════════════════════════════════════════════════════════════════════
    //  FONCTIONS OWNER
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Appelle cette fonction APRÈS avoir ajouté la liquidité sur PancakeSwap.
     *         Elle définit la paire et ouvre le trading.
     * @param _pair Adresse de la pool PancakeSwap RB/BNB
     */
    function openTrading(address _pair) external onlyOwner {
        require(!tradingOpen,        "RB: already open");
        require(_pair != address(0), "RB: zero pair");
        pair        = _pair;
        tradingOpen = true;
        emit TradingOpened(_pair);
    }

    /**
     * @notice Supprime la limite max wallet (à appeler après la phase de lancement).
     */
    function removeLimits() external onlyOwner {
        require(limitsActive, "RB: limits already removed");
        limitsActive = false;
        emit LimitsRemoved();
    }

    /**
     * @notice Modifie les taxes (max 10%).
     *         Exemple : setTax(300, 300) pour passer à 3%/3%.
     *         Exemple : setTax(0, 0) pour supprimer les taxes.
     */
    function setTax(uint256 _buy, uint256 _sell) external onlyOwner {
        require(_buy <= MAX_TAX && _sell <= MAX_TAX, "RB: tax too high (max 10%)");
        buyTax  = _buy;
        sellTax = _sell;
        emit TaxUpdated(_buy, _sell);
    }

    /**
     * @notice Change le wallet qui reçoit les taxes.
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "RB: zero address");
        isExempt[treasury]  = false;
        treasury            = _treasury;
        isExempt[_treasury] = true;
        emit TreasuryUpdated(_treasury);
    }

    /**
     * @notice Exempte une adresse des taxes et de la limite max wallet.
     *         Utile pour les CEX, bridges, partenaires.
     */
    function setExempt(address account, bool exempt) external onlyOwner {
        isExempt[account] = exempt;
        emit ExemptUpdated(account, exempt);
    }

    /**
     * @notice Transfère la propriété du contrat à une nouvelle adresse.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RB: zero address");
        isExempt[owner]    = false;
        isExempt[newOwner] = true;
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}


