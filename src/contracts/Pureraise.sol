// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PureRaise {

    address public admin;

    mapping(uint256 => address) public campaignOwner;

    mapping(uint256 => uint256) public amountRaised;

    mapping(uint256 => uint256) public amountWithdrawn;

    mapping(uint256 => mapping(address => uint256)) public contributions;

    mapping(address => uint256) public totalContributedByDonor;

    mapping(uint256 => bool) public isActive;

    mapping(uint256 => bool) public isCancelled;

    mapping(uint256 => mapping(uint256 => bool)) public milestoneReleased;


    event CampaignOpened(uint256 indexed campaignId, address indexed owner);
    event CampaignCancelled(uint256 indexed campaignId);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, uint256 milestoneIndex, address indexed owner, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);


    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    modifier onlyCampaignOwner(uint256 _campaignId) {
        require(msg.sender == campaignOwner[_campaignId], "Only campaign owner can do this");
        _;
    }


    constructor() {
        admin = msg.sender;
    }

    function openCampaign(uint256 _campaignId, address _owner) external onlyAdmin {
        require(!isActive[_campaignId],    "Campaign already open");
        require(!isCancelled[_campaignId], "Campaign is cancelled");
        require(_owner != address(0),      "Invalid owner address");

        isActive[_campaignId]      = true;
        campaignOwner[_campaignId] = _owner;

        emit CampaignOpened(_campaignId, _owner);
    }

    function contribute(uint256 _campaignId) external payable {
        require(isActive[_campaignId],     "Campaign is not active");
        require(!isCancelled[_campaignId], "Campaign is cancelled");
        require(msg.value > 0,             "Must send ETH to contribute");

        contributions[_campaignId][msg.sender] += msg.value;
        amountRaised[_campaignId]              += msg.value;
        totalContributedByDonor[msg.sender]    += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    function releaseFunds(
        uint256 _campaignId,
        uint256 _milestoneIndex,
        address payable _ownerWallet,
        uint256 _amount
    ) external onlyAdmin {
        require(!isCancelled[_campaignId],                       "Campaign is cancelled");
        require(!milestoneReleased[_campaignId][_milestoneIndex], "Funds already released for this milestone");
        require(amountRaised[_campaignId] >= _amount,            "Not enough funds raised");
        require(address(this).balance >= _amount,                "Contract balance too low");

        milestoneReleased[_campaignId][_milestoneIndex] = true;
        amountWithdrawn[_campaignId] += _amount;

        (bool success, ) = _ownerWallet.call{value: _amount}("");
        require(success, "Transfer to owner failed");

        emit FundsReleased(_campaignId, _milestoneIndex, _ownerWallet, _amount);
    }

    function withdrawFunds(uint256 _campaignId, uint256 _amount) external onlyCampaignOwner(_campaignId) {
        require(!isCancelled[_campaignId], "Campaign is cancelled");

        uint256 available = amountRaised[_campaignId] - amountWithdrawn[_campaignId];
        require(_amount > 0 && _amount <= available, "Invalid withdraw amount");
        require(address(this).balance >= _amount,    "Contract balance too low");

        amountWithdrawn[_campaignId] += _amount;

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Withdraw transfer failed");

        emit FundsWithdrawn(_campaignId, msg.sender, _amount);
    }


    function cancelCampaign(uint256 _campaignId) external onlyAdmin {
        require(!isCancelled[_campaignId], "Already cancelled");

        isCancelled[_campaignId] = true;
        isActive[_campaignId]    = false;

        emit CampaignCancelled(_campaignId);
    }

    function claimRefund(uint256 _campaignId) external {
        require(isCancelled[_campaignId], "Refunds only available for cancelled campaigns");

        uint256 contributed = contributions[_campaignId][msg.sender];
        require(contributed > 0, "Nothing to refund");

        contributions[_campaignId][msg.sender] = 0;
        totalContributedByDonor[msg.sender] -= contributed;

        (bool success, ) = payable(msg.sender).call{value: contributed}("");
        require(success, "Refund transfer failed");

        emit RefundIssued(_campaignId, msg.sender, contributed);
    }


    function getContribution(uint256 _campaignId, address _contributor)
        external view returns (uint256)
    {
        return contributions[_campaignId][_contributor];
    }

    function getDonorTotalContribution(address _contributor)
        external view returns (uint256)
    {
        return totalContributedByDonor[_contributor];
    }

    function getTotalRaised(uint256 _campaignId)
        external view returns (uint256)
    {
        return amountRaised[_campaignId];
    }

    function getAvailableFunds(uint256 _campaignId)
        external view returns (uint256)
    {
        return amountRaised[_campaignId] - amountWithdrawn[_campaignId];
    }

    function getCampaignDetails(uint256 _campaignId)
        external
        view
        returns (
            address owner,
            uint256 raised,
            uint256 withdrawn,
            uint256 available,
            bool active,
            bool cancelled
        )
    {
        owner     = campaignOwner[_campaignId];
        raised    = amountRaised[_campaignId];
        withdrawn = amountWithdrawn[_campaignId];
        available = raised - withdrawn;
        active    = isActive[_campaignId];
        cancelled = isCancelled[_campaignId];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
